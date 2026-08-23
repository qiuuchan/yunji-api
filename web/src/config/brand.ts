/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
/**
 * 品牌常量集中配置（第一期占位值）。
 *
 * 站点品牌位统一从这里取值；正式品牌素材到位后，仅需修改本文件
 * 与 `public/` 下对应静态资源即可完成替换。注意：本文件不涉及
 * new-api / QuantumNous 开源署名信息，后者受项目治理保护、不得改动。
 */

/** 站点品牌名（中性占位名） */
export const BRAND_NAME = 'NovaBridge'

/** 品牌 slogan 的 i18n 键（与英文原文一致），展示时必须通过 t() 使用 */
export const BRAND_SLOGAN = 'Connect Intelligence, Empower Creation'

/** 商务合作邮箱（占位） */
export const BRAND_BUSINESS_EMAIL = 'business@novabridge.io'

/** 企业联系二维码占位图路径（public/ 下相对路径，素材就位后替换文件即可） */
export const BRAND_CONTACT_QR_SRC = '/images/brand/contact-qr-placeholder.svg'
