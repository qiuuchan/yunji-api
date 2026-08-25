package controller

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestGetPublicPlaygroundModelsReturnsAllEnabledModelsForAnonymousVisitor
// covers the visitor semantics of WO-D2-A: GET /api/pg/models must return the
// full deduplicated, group-ordered set of enabled models across every usable
// group, WITHOUT any user context (no id, no auth).
func TestGetPublicPlaygroundModelsReturnsAllEnabledModelsForAnonymousVisitor(t *testing.T) {
	originalUsableGroups := setting.UserUsableGroups2JSONString()
	t.Cleanup(func() {
		require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(originalUsableGroups))
	})

	// Two usable groups, both enabled for the global (anonymous) visitor.
	require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(
		`{"default":"默认分组","vip":"VIP 分组"}`))

	db := setupModelListControllerTestDB(t)
	require.NoError(t, db.Create(&[]model.Ability{
		{Group: "default", Model: "zz-default-model-a", ChannelId: 1, Enabled: true},
		{Group: "default", Model: "zz-shared-model", ChannelId: 1, Enabled: true},
		{Group: "default", Model: "zz-disabled-model", ChannelId: 1, Enabled: false},
		{Group: "vip", Model: "zz-vip-model", ChannelId: 2, Enabled: true},
		{Group: "vip", Model: "zz-shared-model", ChannelId: 3, Enabled: true},
	}).Error)

	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest(http.MethodGet, "/api/pg/models", nil)
	// Intentionally do NOT set "id" or any auth context — anonymous visitor.

	GetPublicPlaygroundModels(context)

	models := decodeUserModelsResponse(t, recorder)
	// Disabled model excluded; shared model deduplicated across groups.
	require.ElementsMatch(t, []string{
		"zz-default-model-a",
		"zz-shared-model",
		"zz-vip-model",
	}, models)
	// Deduplication: the shared model must appear exactly once despite being
	// enabled in two groups.
	sharedCount := 0
	for _, m := range models {
		if m == "zz-shared-model" {
			sharedCount++
		}
	}
	require.Equal(t, 1, sharedCount)
}

// TestGetPublicPlaygroundModelsIgnoresUserContext proves the endpoint is
// genuinely anonymous: even if a user id leaks into the gin context (e.g. via a
// global middleware), it must not alter the result, which must always reflect
// the full global usable-group set.
func TestGetPublicPlaygroundModelsIgnoresUserContext(t *testing.T) {
	originalUsableGroups := setting.UserUsableGroups2JSONString()
	t.Cleanup(func() {
		require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(originalUsableGroups))
	})

	require.NoError(t, setting.UpdateUserUsableGroupsByJSONString(
		`{"default":"默认分组"}`))

	db := setupModelListControllerTestDB(t)
	require.NoError(t, db.Create(&[]model.Ability{
		{Group: "default", Model: "zz-public-model", ChannelId: 1, Enabled: true},
		{Group: "vip", Model: "zz-private-model", ChannelId: 2, Enabled: true},
	}).Error)

	recorder := httptest.NewRecorder()
	context, _ := gin.CreateTestContext(recorder)
	context.Request = httptest.NewRequest(http.MethodGet, "/api/pg/models", nil)
	// Simulate a leaked user id (e.g. from a global middleware) — must be ignored.
	context.Set("id", 9999)

	GetPublicPlaygroundModels(context)

	models := decodeUserModelsResponse(t, recorder)
	// Only the globally usable group's model is returned; vip is not usable.
	assert.Equal(t, []string{"zz-public-model"}, models)
}
