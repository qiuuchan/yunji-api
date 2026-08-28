package model

import (
	"errors"
	"fmt"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// topUpSeq keeps fixture trade numbers unique across fast-running tests.
var topUpSeq int64

// createTopUpFixture inserts a topup row owned by userId with the given status.
func createTopUpFixture(t *testing.T, userId int, status string) *TopUp {
	t.Helper()
	topUpSeq++
	topUp := &TopUp{
		UserId:        userId,
		Amount:        10,
		Money:         9.5,
		TradeNo:       fmt.Sprintf("%s%04dtestinvoice", common.GetTimeString(), topUpSeq),
		PaymentMethod: PaymentMethodStripe,
		CreateTime:    common.GetTimestamp(),
		Status:        status,
	}
	require.NoError(t, DB.Create(topUp).Error)
	t.Cleanup(func() {
		// SQLite 会复用被删除行的 rowid，若不清理发票行，下一个 fixture
		// 拿到同一个 topup id 时会撞上 topup_id 唯一索引
		DB.Where("topup_id = ?", topUp.Id).Delete(&Invoice{})
		DB.Delete(&TopUp{}, topUp.Id)
	})
	return topUp
}

func newInvoiceRequest(t *testing.T, userId int, topUp *TopUp) *Invoice {
	t.Helper()
	return &Invoice{
		UserId:    userId,
		TopupId:   topUp.Id,
		TitleType: InvoiceTitleTypePersonal,
		Title:     "张三",
		Email:     "user@example.com",
	}
}

func TestSubmitInvoice_SuccessSnapshotsAmountAndTradeNo(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)

	err := SubmitInvoice(newInvoiceRequest(t, 1, topUp))

	require.NoError(t, err)
	stored := &Invoice{}
	require.NoError(t, DB.Where("topup_id = ?", topUp.Id).First(stored).Error)
	assert.Equal(t, InvoiceStatusPending, stored.Status)
	// 金额与订单号取服务端 topup 快照，不信任前端传值
	assert.Equal(t, topUp.Money, stored.Amount)
	assert.Equal(t, topUp.TradeNo, stored.TradeNo)
	assert.NotZero(t, stored.CreateTime)
}

func TestSubmitInvoice_RejectsTopUpNotOwnedByUser(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)

	err := SubmitInvoice(newInvoiceRequest(t, 2, topUp))

	assert.ErrorIs(t, err, ErrInvoiceTopUpNotFound)
}

func TestSubmitInvoice_RejectsTopUpNotSuccessful(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusPending)

	err := SubmitInvoice(newInvoiceRequest(t, 1, topUp))

	assert.ErrorIs(t, err, ErrInvoiceTopUpNotSuccess)
}

func TestSubmitInvoice_RejectsMissingTopUp(t *testing.T) {
	err := SubmitInvoice(&Invoice{UserId: 1, TopupId: 987654321})

	assert.ErrorIs(t, err, ErrInvoiceTopUpNotFound)
}

func TestSubmitInvoice_RejectsDuplicateWhilePending(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUp)))

	err := SubmitInvoice(newInvoiceRequest(t, 1, topUp))

	assert.ErrorIs(t, err, ErrInvoiceAlreadyApplied)
}

func TestSubmitInvoice_RejectsDuplicateWhenAlreadyIssued(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUp)))
	require.NoError(t, ReviewInvoice(mustInvoiceId(t, topUp.Id), "issue", "", "https://example.com/invoice.pdf"))

	err := SubmitInvoice(newInvoiceRequest(t, 1, topUp))

	assert.ErrorIs(t, err, ErrInvoiceAlreadyApplied)
}

func TestSubmitInvoice_ResubmitAfterRejectionReusesSameRow(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUp)))
	invoiceId := mustInvoiceId(t, topUp.Id)
	require.NoError(t, ReviewInvoice(invoiceId, "reject", "抬头与付款方不一致", ""))

	resubmit := newInvoiceRequest(t, 1, topUp)
	resubmit.TitleType = InvoiceTitleTypeCompany
	resubmit.Title = "示例科技有限公司"
	resubmit.TaxId = "91310000MA1FL0Q84K"
	resubmit.Email = "finance@example.com"
	require.NoError(t, SubmitInvoice(resubmit))

	stored := &Invoice{}
	require.NoError(t, DB.Where("topup_id = ?", topUp.Id).First(stored).Error)
	assert.Equal(t, invoiceId, stored.Id, "重新申请应复用原行")
	assert.Equal(t, InvoiceStatusPending, stored.Status)
	assert.Equal(t, InvoiceTitleTypeCompany, stored.TitleType)
	assert.Equal(t, "91310000MA1FL0Q84K", stored.TaxId)
	assert.Equal(t, "finance@example.com", stored.Email)
	// 重新申请后清空上次的驳回理由与发票链接
	assert.Empty(t, stored.AdminRemark)
	assert.Empty(t, stored.InvoiceUrl)

	var count int64
	require.NoError(t, DB.Model(&Invoice{}).Where("topup_id = ?", topUp.Id).Count(&count).Error)
	assert.Equal(t, int64(1), count, "一条充值记录只能有一条发票申请")
}

func TestReviewInvoice_PendingToIssued(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUp)))

	require.NoError(t, ReviewInvoice(mustInvoiceId(t, topUp.Id), "issue", "已开具", "https://example.com/invoice.pdf"))

	stored := &Invoice{}
	require.NoError(t, DB.Where("topup_id = ?", topUp.Id).First(stored).Error)
	assert.Equal(t, InvoiceStatusIssued, stored.Status)
	assert.Equal(t, "https://example.com/invoice.pdf", stored.InvoiceUrl)
	assert.Equal(t, "已开具", stored.AdminRemark)
}

func TestReviewInvoice_RejectRequiresRemark(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUp)))

	err := ReviewInvoice(mustInvoiceId(t, topUp.Id), "reject", "   ", "")

	assert.ErrorIs(t, err, ErrInvoiceRemarkRequired)
	stored := &Invoice{}
	require.NoError(t, DB.Where("topup_id = ?", topUp.Id).First(stored).Error)
	assert.Equal(t, InvoiceStatusPending, stored.Status, "驳回失败不应改变状态")
}

func TestReviewInvoice_RejectsNonPendingApplication(t *testing.T) {
	topUp := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUp)))
	id := mustInvoiceId(t, topUp.Id)
	require.NoError(t, ReviewInvoice(id, "issue", "", ""))

	// 已开票的申请不能再被审核
	assert.ErrorIs(t, ReviewInvoice(id, "issue", "", ""), ErrInvoiceStatusInvalid)
	assert.ErrorIs(t, ReviewInvoice(id, "reject", "理由", ""), ErrInvoiceStatusInvalid)
}

func TestReviewInvoice_RejectsUnknownId(t *testing.T) {
	assert.ErrorIs(t, ReviewInvoice(987654321, "issue", "", ""), ErrInvoiceNotFound)
}

func TestGetUserInvoices_ReturnsOnlyOwnApplications(t *testing.T) {
	topUpOne := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	topUpTwo := createTopUpFixture(t, 2, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUpOne)))
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 2, topUpTwo)))

	pageInfo := &common.PageInfo{Page: 1, PageSize: 10}
	invoices, total, err := GetUserInvoices(1, pageInfo)

	require.NoError(t, err)
	assert.Equal(t, int64(1), total)
	require.Len(t, invoices, 1)
	assert.Equal(t, topUpOne.TradeNo, invoices[0].TradeNo)
}

func TestGetAllInvoices_FiltersByStatusAndKeyword(t *testing.T) {
	topUpOne := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	topUpTwo := createTopUpFixture(t, 2, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUpOne)))
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 2, topUpTwo)))
	require.NoError(t, ReviewInvoice(mustInvoiceId(t, topUpTwo.Id), "issue", "", ""))

	pageInfo := &common.PageInfo{Page: 1, PageSize: 10}

	pending, pendingTotal, err := GetAllInvoices(pageInfo, InvoiceStatusPending, "")
	require.NoError(t, err)
	assert.Equal(t, int64(1), pendingTotal)
	require.Len(t, pending, 1)
	assert.Equal(t, topUpOne.TradeNo, pending[0].TradeNo)

	issued, issuedTotal, err := GetAllInvoices(pageInfo, InvoiceStatusIssued, "")
	require.NoError(t, err)
	assert.Equal(t, int64(1), issuedTotal)
	require.Len(t, issued, 1)
	assert.Equal(t, topUpTwo.TradeNo, issued[0].TradeNo)

	// 关键字按订单号精确匹配
	byTradeNo, byTradeNoTotal, err := GetAllInvoices(pageInfo, "", topUpOne.TradeNo)
	require.NoError(t, err)
	assert.Equal(t, int64(1), byTradeNoTotal)
	require.Len(t, byTradeNo, 1)
	assert.Equal(t, topUpOne.TradeNo, byTradeNo[0].TradeNo)

	// 关键字按抬头匹配
	byTitle, byTitleTotal, err := GetAllInvoices(pageInfo, "", newInvoiceRequest(t, 1, topUpOne).Title)
	require.NoError(t, err)
	assert.Equal(t, int64(2), byTitleTotal, "两条申请抬头相同，应全部命中")
	assert.Len(t, byTitle, 2)
}

func TestGetAllInvoices_Paginates(t *testing.T) {
	topUpOne := createTopUpFixture(t, 1, common.TopUpStatusSuccess)
	topUpTwo := createTopUpFixture(t, 2, common.TopUpStatusSuccess)
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 1, topUpOne)))
	require.NoError(t, SubmitInvoice(newInvoiceRequest(t, 2, topUpTwo)))

	firstPage, total, err := GetAllInvoices(&common.PageInfo{Page: 1, PageSize: 1}, "", "")
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)
	require.Len(t, firstPage, 1)

	secondPage, _, err := GetAllInvoices(&common.PageInfo{Page: 2, PageSize: 1}, "", "")
	require.NoError(t, err)
	require.Len(t, secondPage, 1)
	assert.NotEqual(t, firstPage[0].Id, secondPage[0].Id, "两页应返回不同的申请")
}

func TestIsUniqueConstraintError(t *testing.T) {
	assert.False(t, isUniqueConstraintError(nil))
	assert.True(t, isUniqueConstraintError(errors.New("UNIQUE constraint failed: invoices.topup_id")))
	assert.True(t, isUniqueConstraintError(errors.New("Error 1062: Duplicate entry '1' for key 'invoices.topup_id'")))
	assert.True(t, isUniqueConstraintError(errors.New("pq: duplicate key value violates unique constraint")))
	assert.False(t, isUniqueConstraintError(errors.New("no such table: invoices")))
}

// mustInvoiceId 返回指定 topup 的发票申请 id
func mustInvoiceId(t *testing.T, topupId int) int {
	t.Helper()
	invoice := &Invoice{}
	require.NoError(t, DB.Where("topup_id = ?", topupId).First(invoice).Error)
	return invoice.Id
}
