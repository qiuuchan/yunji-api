package controller

import (
	"errors"
	"net/mail"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/i18n"
	"github.com/QuantumNous/new-api/model"
	"github.com/gin-gonic/gin"
)

// 发票申请字段长度上限
const (
	invoiceTitleMaxLen  = 100
	invoiceTaxIdMaxLen  = 64
	invoiceEmailMaxLen  = 255
	invoiceRemarkMaxLen = 500
	invoiceUrlMaxLen    = 500
)

type SubmitInvoiceRequest struct {
	TopupId   int    `json:"topup_id"`
	TitleType string `json:"title_type"`
	Title     string `json:"title"`
	TaxId     string `json:"tax_id"`
	Email     string `json:"email"`
}

type AdminReviewInvoiceRequest struct {
	Id          int    `json:"id"`
	Action      string `json:"action"`
	AdminRemark string `json:"admin_remark"`
	InvoiceUrl  string `json:"invoice_url"`
}

// normalizeInvoiceText 去掉首尾空白并按上限截断
func normalizeInvoiceText(value string, maxLen int) string {
	value = strings.TrimSpace(value)
	if len(value) > maxLen {
		return value[:maxLen]
	}
	return value
}

// validateInvoiceApplication 校验发票申请入参，返回 i18n 错误 key
func validateInvoiceApplication(req *SubmitInvoiceRequest) (string, bool) {
	if req.TopupId <= 0 {
		return i18n.MsgInvoiceInvalidParams, false
	}
	if req.TitleType != model.InvoiceTitleTypePersonal && req.TitleType != model.InvoiceTitleTypeCompany {
		return i18n.MsgInvoiceInvalidTitleType, false
	}
	if req.Title == "" {
		return i18n.MsgInvoiceTitleRequired, false
	}
	if req.TitleType == model.InvoiceTitleTypeCompany && req.TaxId == "" {
		return i18n.MsgInvoiceTaxIdRequired, false
	}
	if req.Email == "" {
		return i18n.MsgInvoiceEmailRequired, false
	}
	if _, err := mail.ParseAddress(req.Email); err != nil {
		return i18n.MsgInvoiceEmailInvalid, false
	}
	return "", true
}

// SubmitInvoiceApplication 用户提交发票申请
func SubmitInvoiceApplication(c *gin.Context) {
	var req SubmitInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ApiErrorI18n(c, i18n.MsgInvoiceInvalidParams)
		return
	}

	req.TitleType = strings.TrimSpace(req.TitleType)
	req.Title = normalizeInvoiceText(req.Title, invoiceTitleMaxLen)
	req.TaxId = normalizeInvoiceText(req.TaxId, invoiceTaxIdMaxLen)
	req.Email = normalizeInvoiceText(req.Email, invoiceEmailMaxLen)

	if key, ok := validateInvoiceApplication(&req); !ok {
		common.ApiErrorI18n(c, key)
		return
	}

	invoice := &model.Invoice{
		UserId:    c.GetInt("id"),
		TopupId:   req.TopupId,
		TitleType: req.TitleType,
		Title:     req.Title,
		TaxId:     req.TaxId,
		Email:     req.Email,
	}

	if err := model.SubmitInvoice(invoice); err != nil {
		common.ApiErrorI18n(c, invoiceErrorKey(err))
		return
	}
	common.ApiSuccessI18n(c, i18n.MsgInvoiceSubmitSuccess, nil)
}

// GetUserInvoices 获取当前用户的发票申请列表
func GetUserInvoices(c *gin.Context) {
	userId := c.GetInt("id")
	pageInfo := common.GetPageQuery(c)

	invoices, total, err := model.GetUserInvoices(userId, pageInfo)
	if err != nil {
		common.ApiErrorI18n(c, i18n.MsgInvoiceInvalidParams)
		return
	}

	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(invoices)
	common.ApiSuccess(c, pageInfo)
}

// GetAllInvoices 管理员获取全平台发票申请列表
func GetAllInvoices(c *gin.Context) {
	pageInfo := common.GetPageQuery(c)
	status := strings.TrimSpace(c.Query("status"))
	keyword := strings.TrimSpace(c.Query("keyword"))

	if !isValidInvoiceStatusFilter(status) {
		common.ApiErrorI18n(c, i18n.MsgInvoiceInvalidStatusFilter)
		return
	}

	invoices, total, err := model.GetAllInvoices(pageInfo, status, keyword)
	if err != nil {
		common.ApiErrorI18n(c, i18n.MsgInvoiceInvalidParams)
		return
	}

	pageInfo.SetTotal(int(total))
	pageInfo.SetItems(invoices)
	common.ApiSuccess(c, pageInfo)
}

// AdminReviewInvoice 管理员审核发票申请
func AdminReviewInvoice(c *gin.Context) {
	var req AdminReviewInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Id <= 0 {
		common.ApiErrorI18n(c, i18n.MsgInvoiceInvalidParams)
		return
	}

	req.Action = strings.TrimSpace(req.Action)
	if req.Action != "issue" && req.Action != "reject" {
		common.ApiErrorI18n(c, i18n.MsgInvoiceInvalidAction)
		return
	}

	req.AdminRemark = normalizeInvoiceText(req.AdminRemark, invoiceRemarkMaxLen)
	req.InvoiceUrl = normalizeInvoiceText(req.InvoiceUrl, invoiceUrlMaxLen)

	if err := model.ReviewInvoice(req.Id, req.Action, req.AdminRemark, req.InvoiceUrl); err != nil {
		common.ApiErrorI18n(c, invoiceErrorKey(err))
		return
	}
	common.ApiSuccessI18n(c, i18n.MsgInvoiceReviewSuccess, nil)
}

// isValidInvoiceStatusFilter 空值表示不筛选，其余必须是合法状态
func isValidInvoiceStatusFilter(status string) bool {
	return status == "" ||
		status == model.InvoiceStatusPending ||
		status == model.InvoiceStatusIssued ||
		status == model.InvoiceStatusRejected
}

// invoiceErrorKey 把 model 层错误映射为 i18n key
func invoiceErrorKey(err error) string {
	switch {
	case errors.Is(err, model.ErrInvoiceTopUpNotFound):
		return i18n.MsgInvoiceTopUpNotFound
	case errors.Is(err, model.ErrInvoiceTopUpNotSuccess):
		return i18n.MsgInvoiceTopUpNotSuccess
	case errors.Is(err, model.ErrInvoiceAlreadyApplied):
		return i18n.MsgInvoiceAlreadyApplied
	case errors.Is(err, model.ErrInvoiceNotFound):
		return i18n.MsgInvoiceNotFound
	case errors.Is(err, model.ErrInvoiceStatusInvalid):
		return i18n.MsgInvoiceStatusInvalid
	case errors.Is(err, model.ErrInvoiceRemarkRequired):
		return i18n.MsgInvoiceRemarkRequired
	default:
		return i18n.MsgInvoiceInvalidParams
	}
}
