package model

import (
	"errors"
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"gorm.io/gorm"
)

// 发票申请状态
const (
	InvoiceStatusPending  = "pending"
	InvoiceStatusIssued   = "issued"
	InvoiceStatusRejected = "rejected"
)

// 发票抬头类型
const (
	InvoiceTitleTypePersonal = "personal"
	InvoiceTitleTypeCompany  = "company"
)

var (
	ErrInvoiceTopUpNotFound   = errors.New("invoice.topup_not_found")
	ErrInvoiceTopUpNotSuccess = errors.New("invoice.topup_not_success")
	ErrInvoiceAlreadyApplied  = errors.New("invoice.already_applied")
	ErrInvoiceNotFound        = errors.New("invoice.not_found")
	ErrInvoiceStatusInvalid   = errors.New("invoice.status_invalid")
	ErrInvoiceRemarkRequired  = errors.New("invoice.remark_required")
)

// Invoice 发票申请记录，一条充值记录最多一条发票申请
type Invoice struct {
	Id          int     `json:"id" gorm:"primaryKey;autoIncrement"`
	UserId      int     `json:"user_id" gorm:"index"`
	TopupId     int     `json:"topup_id" gorm:"uniqueIndex"`
	TradeNo     string  `json:"trade_no" gorm:"type:varchar(255);index"`
	Amount      float64 `json:"amount"`
	TitleType   string  `json:"title_type" gorm:"type:varchar(20)"`
	Title       string  `json:"title" gorm:"type:varchar(255)"`
	TaxId       string  `json:"tax_id" gorm:"type:varchar(64)"`
	Email       string  `json:"email" gorm:"type:varchar(255)"`
	Status      string  `json:"status" gorm:"type:varchar(20);index"`
	AdminRemark string  `json:"admin_remark" gorm:"type:varchar(500)"`
	InvoiceUrl  string  `json:"invoice_url" gorm:"type:varchar(500)"`
	CreateTime  int64   `json:"create_time"`
	UpdateTime  int64   `json:"update_time"`
}

func (Invoice) TableName() string {
	return "invoices"
}

// 已占用状态：这些状态下不允许重复申请，也不允许被新的申请覆盖
func invoiceStatusOccupied(status string) bool {
	return status == InvoiceStatusPending || status == InvoiceStatusIssued
}

// isUniqueConstraintError 判断是否为唯一索引冲突，用于 topup_id 唯一约束的并发兜底。
// 各驱动的错误字符串不一致，这里按三种数据库的常见文案统一识别。
func isUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "unique constraint") ||
		strings.Contains(msg, "duplicate key") ||
		strings.Contains(msg, "duplicate entry") ||
		strings.Contains(msg, "constraint failed")
}

// SubmitInvoice 提交发票申请。
// 规则：目标 topup 必须存在、属于本人且已成功；已有 pending/issued 申请则拒绝；
// rejected 的申请会被更新为 pending 实现重新申请。
func SubmitInvoice(invoice *Invoice) error {
	topUp := &TopUp{}
	if err := DB.Where("id = ?", invoice.TopupId).First(topUp).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrInvoiceTopUpNotFound
		}
		return err
	}
	if topUp.UserId != invoice.UserId {
		return ErrInvoiceTopUpNotFound
	}
	if topUp.Status != common.TopUpStatusSuccess {
		return ErrInvoiceTopUpNotSuccess
	}

	now := common.GetTimestamp()
	// 金额以服务端 topup 记录为准，不信任前端传值
	invoice.TradeNo = topUp.TradeNo
	invoice.Amount = topUp.Money

	return DB.Transaction(func(tx *gorm.DB) error {
		existing := &Invoice{}
		err := tx.Where("topup_id = ?", invoice.TopupId).First(existing).Error
		if err == nil {
			if invoiceStatusOccupied(existing.Status) {
				return ErrInvoiceAlreadyApplied
			}
			// 已驳回的申请复用原行，重新进入待处理
			invoice.Id = existing.Id
			invoice.UserId = existing.UserId
			invoice.Status = InvoiceStatusPending
			invoice.AdminRemark = ""
			invoice.InvoiceUrl = ""
			invoice.CreateTime = existing.CreateTime
			invoice.UpdateTime = now
			return tx.Save(invoice).Error
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return err
		}

		invoice.Status = InvoiceStatusPending
		invoice.CreateTime = now
		invoice.UpdateTime = now
		// 并发兜底：topup_id 唯一索引
		if err := tx.Create(invoice).Error; err != nil {
			if isUniqueConstraintError(err) {
				return ErrInvoiceAlreadyApplied
			}
			return err
		}
		return nil
	})
}

// GetUserInvoices 分页获取指定用户的发票申请
func GetUserInvoices(userId int, pageInfo *common.PageInfo) (invoices []*Invoice, total int64, err error) {
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err = tx.Model(&Invoice{}).Where("user_id = ?", userId).Count(&total).Error; err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	if err = tx.Where("user_id = ?", userId).Order("id desc").
		Limit(pageInfo.GetPageSize()).Offset(pageInfo.GetStartIdx()).Find(&invoices).Error; err != nil {
		tx.Rollback()
		return nil, 0, err
	}

	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}
	return invoices, total, nil
}

// GetAllInvoices 分页获取全平台发票申请（管理员使用），支持状态与关键字筛选
func GetAllInvoices(pageInfo *common.PageInfo, status string, keyword string) (invoices []*Invoice, total int64, err error) {
	tx := DB.Begin()
	if tx.Error != nil {
		return nil, 0, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	query := tx.Model(&Invoice{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if keyword != "" {
		pattern, perr := sanitizeLikePattern(keyword)
		if perr != nil {
			tx.Rollback()
			return nil, 0, perr
		}
		query = query.Where("(trade_no LIKE ? ESCAPE '!' OR title LIKE ? ESCAPE '!')", pattern, pattern)
	}

	if err = query.Count(&total).Error; err != nil {
		tx.Rollback()
		common.SysError("failed to count invoices: " + err.Error())
		return nil, 0, errors.New("搜索发票申请失败")
	}

	if err = query.Order("id desc").Limit(pageInfo.GetPageSize()).
		Offset(pageInfo.GetStartIdx()).Find(&invoices).Error; err != nil {
		tx.Rollback()
		common.SysError("failed to query invoices: " + err.Error())
		return nil, 0, errors.New("搜索发票申请失败")
	}

	if err = tx.Commit().Error; err != nil {
		return nil, 0, err
	}
	return invoices, total, nil
}

// ReviewInvoice 管理员审核发票申请，仅允许 pending → issued / rejected
func ReviewInvoice(id int, action string, adminRemark string, invoiceUrl string) error {
	invoice := &Invoice{}
	if err := DB.Where("id = ?", id).First(invoice).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrInvoiceNotFound
		}
		return err
	}
	if invoice.Status != InvoiceStatusPending {
		return ErrInvoiceStatusInvalid
	}

	// 驳回理由只允许由本层判定是否为空，调用方的空白输入不算有效理由
	adminRemark = strings.TrimSpace(adminRemark)

	updates := map[string]interface{}{
		"update_time": common.GetTimestamp(),
	}
	switch action {
	case "issue":
		updates["status"] = InvoiceStatusIssued
		updates["admin_remark"] = adminRemark
		updates["invoice_url"] = invoiceUrl
	case "reject":
		if adminRemark == "" {
			return ErrInvoiceRemarkRequired
		}
		updates["status"] = InvoiceStatusRejected
		updates["admin_remark"] = adminRemark
		updates["invoice_url"] = ""
	default:
		return fmt.Errorf("unknown invoice review action: %s", action)
	}

	return DB.Model(&Invoice{}).Where("id = ? AND status = ?", id, InvoiceStatusPending).
		Updates(updates).Error
}
