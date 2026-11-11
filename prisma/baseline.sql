-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPERADMIN', 'ADMIN', 'STORE_MANAGER', 'CUSTOMER_SUPPORT', 'SELLER', 'CUSTOMER', 'DELIVERY_PARTNER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK_TRANSFER', 'WISE', 'CRYPTO_USDT', 'GREY');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "LedgerType" AS ENUM ('SALE_CREDIT', 'PLATFORM_FEE_DEBIT', 'PAYOUT_DEBIT', 'REFUND_DEBIT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PENDING_VERIFICATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'BANK_TRANSFER', 'MOBILE_MONEY', 'MTN_MOMO', 'ORANGE_MONEY', 'CASH_ON_DELIVERY', 'CASH_ON_PICKUP');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID', 'PENDING_VERIFICATION', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProductBadge" AS ENUM ('ELITE', 'NEW', 'PROMO', 'LOW_STOCK', 'VERIFIED');

-- CreateEnum
CREATE TYPE "SuggestionCategory" AS ENUM ('FEATURE_REQUEST', 'UX_FEEDBACK', 'PRICING', 'SELLER_TOOLS', 'OTHER');

-- CreateEnum
CREATE TYPE "SuggestionStatus" AS ENUM ('NEW', 'REVIEWED', 'PLANNED', 'IMPLEMENTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('SELLER', 'PRODUCT', 'USER', 'ORDER');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('SELLER', 'PRODUCT', 'USER', 'ORDER');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('FRAUD', 'COUNTERFEIT', 'HARASSMENT', 'WRONG_ITEM', 'PROHIBITED', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "BusinessCapability" AS ENUM ('RETAIL', 'RESTAURANT', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "BusinessMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'CASHIER', 'INVENTORY_MANAGER', 'RESTAURANT_MANAGER');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('STORE', 'WAREHOUSE', 'RESTAURANT', 'PICKUP_POINT');

-- CreateEnum
CREATE TYPE "RestaurantOrderStatus" AS ENUM ('PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FulfillmentType" AS ENUM ('DELIVERY', 'PICKUP', 'DINE_IN');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('SELLER', 'PLATFORM', 'THIRD_PARTY');

-- CreateEnum
CREATE TYPE "DeliveryJobStatus" AS ENUM ('CREATED', 'SEARCHING_PARTNER', 'ASSIGNED', 'ACCEPTED', 'AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryPartnerStatus" AS ENUM ('OFFLINE', 'AVAILABLE', 'BUSY', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "SupplyOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACCEPTED', 'PARTIALLY_FULFILLED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('OPEN', 'QUOTED', 'AWARDED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BusinessOrderStatus" AS ENUM ('DRAFT', 'PENDING', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AIChatPurpose" AS ENUM ('SHOPPING', 'CUSTOMER_SUPPORT', 'SELLER_ASSISTANCE', 'RESTAURANT_ASSISTANCE', 'GENERAL');

-- CreateEnum
CREATE TYPE "SupportCategory" AS ENUM ('ORDER_STATUS', 'PAYMENT', 'DELIVERY', 'RETURNS_REFUNDS', 'PRODUCT_QUESTION', 'ACCOUNT', 'SELLER_ISSUE', 'RESTAURANT_ISSUE', 'WHOLESALE', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "SupportChannel" AS ENUM ('WEB_CHAT', 'MOBILE_APP', 'EMAIL', 'PHONE', 'WHATSAPP', 'ADMIN');

-- CreateEnum
CREATE TYPE "SupportResolution" AS ENUM ('AI_RESOLVED', 'HUMAN_RESOLVED', 'CUSTOMER_CANCELLED', 'UNRESOLVED');

-- CreateEnum
CREATE TYPE "SupportKnowledgeStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AIChatRole" AS ENUM ('SYSTEM', 'USER', 'ASSISTANT', 'TOOL');

-- CreateEnum
CREATE TYPE "AIRecommendationSource" AS ENUM ('HOME_PAGE', 'PRODUCT_DETAIL', 'SEARCH_RESULTS', 'CART', 'CHECKOUT', 'CHAT_ASSISTANT', 'EMAIL_CAMPAIGN', 'ADMIN_CAMPAIGN');

-- CreateEnum
CREATE TYPE "AIRecommendationEventType" AS ENUM ('IMPRESSION', 'CLICK', 'ADD_TO_CART', 'REMOVE_FROM_CART', 'PURCHASE', 'DISMISS', 'SAVE');

-- CreateTable
CREATE TABLE "locales" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isRtl" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locales_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "emoji" TEXT,
    "imageUrl" TEXT,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeSlug" TEXT NOT NULL,
    "bio" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "whatsappNumber" TEXT,
    "whatsappEnabled" BOOLEAN NOT NULL DEFAULT true,
    "preferredLocale" TEXT NOT NULL DEFAULT 'en',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "isElite" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "payoutMethod" "PayoutMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "payoutDetails" JSONB,
    "balance" DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "location" geography(Point, 4326),
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_verifications" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "businessCountry" TEXT NOT NULL,
    "businessCity" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "nationalIdUrl" TEXT,
    "businessRegDocUrl" TEXT,
    "taxIdUrl" TEXT,
    "proofOfAddressUrl" TEXT,
    "selfieWithIdUrl" TEXT,
    "storeFrontPhotoUrl" TEXT,
    "productCategories" TEXT[],
    "estimatedMonthlyGmv" TEXT NOT NULL,
    "hasPhysicalInventory" BOOLEAN NOT NULL DEFAULT true,
    "whatsappNumber" TEXT NOT NULL,
    "instagramHandle" TEXT,
    "facebookPageUrl" TEXT,
    "referralCode" TEXT,
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "seller_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "comparePrice" DECIMAL(14,2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "weekSales" INTEGER NOT NULL DEFAULT 0,
    "deliveryTime" TEXT,
    "tags" TEXT[],
    "badge" "ProductBadge",
    "aiEmbedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "r2Url" TEXT NOT NULL,
    "altText" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "locationId" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "lsOrderId" TEXT,
    "lsCheckoutUrl" TEXT,
    "transferRef" TEXT,
    "subtotal" DECIMAL(14,2) NOT NULL,
    "platformFee" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "shippingAddress" JSONB,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PayoutMethod" NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "txReference" TEXT,
    "adminNote" TEXT,
    "processedBy" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "orderId" TEXT,
    "payoutId" TEXT,
    "type" "LedgerType" NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "balance" DECIMAL(14,2) NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" "SuggestionCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "SuggestionStatus" NOT NULL DEFAULT 'NEW',
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion_votes" (
    "id" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suggestion_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceUrls" TEXT[],
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_tickets" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "orderId" TEXT,
    "subject" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'NORMAL',
    "category" "SupportCategory" NOT NULL DEFAULT 'OTHER',
    "channel" "SupportChannel" NOT NULL DEFAULT 'WEB_CHAT',
    "resolution" "SupportResolution",
    "aiHandled" BOOLEAN NOT NULL DEFAULT false,
    "escalatedAt" TIMESTAMP(3),
    "firstResponseAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "customerSatisfaction" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAI" BOOLEAN NOT NULL DEFAULT false,
    "aiModel" TEXT,
    "confidence" DOUBLE PRECISION,
    "isInternalNote" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_options" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_translations" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "product_option_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_values" (
    "id" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_value_translations" (
    "id" TEXT NOT NULL,
    "optionValueId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "product_option_value_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "name" TEXT,
    "price" DECIMAL(14,2),
    "comparePrice" DECIMAL(14,2),
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_translations" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "product_variant_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_values" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "optionValueId" TEXT NOT NULL,

    CONSTRAINT "product_variant_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_relations" (
    "id" TEXT NOT NULL,
    "sourceProductId" TEXT NOT NULL,
    "targetProductId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL DEFAULT 'RELATED',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_profiles" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "capabilities" "BusinessCapability"[],
    "registrationNumber" TEXT,
    "taxNumber" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_profile_translations" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "business_profile_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_memberships" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "BusinessMemberRole" NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "invitedById" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_locations" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "locationType" "LocationType" NOT NULL DEFAULT 'STORE',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "region" TEXT,
    "postalCode" TEXT,
    "country" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geo" geography(Point, 4326),
    "deliveryRadiusKm" DOUBLE PRECISION,
    "offersDelivery" BOOLEAN NOT NULL DEFAULT false,
    "offersPickup" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "openingHours" JSONB,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_location_translations" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,

    CONSTRAINT "business_location_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_location_memberships" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_location_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_location_inventory" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "price" DECIMAL(14,2),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_location_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_location_inventory" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_location_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_profiles" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "cuisineTypes" TEXT[],
    "description" TEXT,
    "averagePrepMinutes" INTEGER NOT NULL DEFAULT 30,
    "acceptsOrders" BOOLEAN NOT NULL DEFAULT true,
    "acceptsReservations" BOOLEAN NOT NULL DEFAULT true,
    "minimumOrder" DECIMAL(14,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_profile_translations" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "restaurant_profile_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_menu_categories" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_menu_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_menu_category_translations" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "restaurant_menu_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_menu_items" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isVegetarian" BOOLEAN NOT NULL DEFAULT false,
    "isVegan" BOOLEAN NOT NULL DEFAULT false,
    "allergens" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_menu_item_locations" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "price" DECIMAL(14,2),
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "prepMinutes" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_menu_item_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_menu_item_translations" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "restaurant_menu_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_orders" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "RestaurantOrderStatus" NOT NULL DEFAULT 'PLACED',
    "fulfillmentType" "FulfillmentType" NOT NULL DEFAULT 'DELIVERY',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "deliveryFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "platformFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "locale" TEXT NOT NULL DEFAULT 'en',
    "deliveryAddress" JSONB,
    "requestedFor" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "options" JSONB,

    CONSTRAINT "restaurant_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "partySize" INTEGER NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'REQUESTED',
    "customerName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "specialRequest" TEXT,
    "internalNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_partners" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "DeliveryPartnerStatus" NOT NULL DEFAULT 'OFFLINE',
    "vehicleType" TEXT,
    "vehiclePlate" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "currentLatitude" DOUBLE PRECISION,
    "currentLongitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_jobs" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "restaurantOrderId" TEXT,
    "businessOrderId" TEXT,
    "partnerId" TEXT,
    "mode" "DeliveryMode" NOT NULL DEFAULT 'PLATFORM',
    "status" "DeliveryJobStatus" NOT NULL DEFAULT 'CREATED',
    "pickupAddress" JSONB NOT NULL,
    "dropoffAddress" JSONB NOT NULL,
    "distanceKm" DOUBLE PRECISION,
    "estimatedMinutes" INTEGER,
    "deliveryFee" DECIMAL(14,2),
    "assignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_status_history" (
    "id" TEXT NOT NULL,
    "deliveryJobId" TEXT NOT NULL,
    "status" "DeliveryJobStatus" NOT NULL,
    "note" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_profiles" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "description" TEXT,
    "minimumOrderValue" DECIMAL(14,2),
    "leadTimeDays" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_retailers" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_retailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wholesale_prices" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wholesale_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_orders" (
    "id" TEXT NOT NULL,
    "retailerUserId" TEXT NOT NULL,
    "retailerBusinessId" TEXT,
    "supplierBusinessId" TEXT NOT NULL,
    "supplierProfileId" TEXT,
    "retailerLocationId" TEXT,
    "supplierLocationId" TEXT,
    "status" "SupplyOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_order_items" (
    "id" TEXT NOT NULL,
    "supplyOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "supply_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "request_for_quotations" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "RfqStatus" NOT NULL DEFAULT 'OPEN',
    "neededBy" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "request_for_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_items" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "productId" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'unit',

    CONSTRAINT "rfq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_quotations" (
    "id" TEXT NOT NULL,
    "rfqId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "message" TEXT,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "supplier_quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_quotation_items" (
    "id" TEXT NOT NULL,
    "quotationId" TEXT NOT NULL,
    "rfqItemId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "supplier_quotation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_orders" (
    "id" TEXT NOT NULL,
    "buyerUserId" TEXT NOT NULL,
    "buyerBusinessId" TEXT NOT NULL,
    "supplierBusinessId" TEXT NOT NULL,
    "buyerLocationId" TEXT,
    "supplierLocationId" TEXT,
    "status" "BusinessOrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "deliveryFee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,

    CONSTRAINT "business_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_knowledge_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "category" "SupportCategory" NOT NULL DEFAULT 'OTHER',
    "status" "SupportKnowledgeStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "sourceUrl" TEXT,
    "reviewedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "support_knowledge_chunks" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "chunkNo" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionKey" TEXT,
    "purpose" "AIChatPurpose" NOT NULL DEFAULT 'SHOPPING',
    "supportTicketId" TEXT,
    "title" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "context" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_messages" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "AIChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "locale" TEXT,
    "referencedProductId" TEXT,
    "toolName" TEXT,
    "toolCallId" TEXT,
    "metadata" JSONB,
    "promptTokens" INTEGER,
    "completionTokens" INTEGER,
    "feedbackRating" INTEGER,
    "feedbackText" TEXT,
    "safetyFlag" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_product_recommendations" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "source" "AIRecommendationSource" NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "algorithm" TEXT,
    "context" JSONB,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_product_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_product_recommendation_items" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "score" DOUBLE PRECISION,
    "reasonCode" TEXT,
    "explanation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_product_recommendation_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_recommendation_events" (
    "id" TEXT NOT NULL,
    "recommendationId" TEXT,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionKey" TEXT,
    "eventType" "AIRecommendationEventType" NOT NULL,
    "source" "AIRecommendationSource" NOT NULL,
    "position" INTEGER,
    "orderId" TEXT,
    "businessOrderId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_recommendation_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_level_parentId_idx" ON "categories"("level", "parentId");

-- CreateIndex
CREATE INDEX "category_translations_locale_idx" ON "category_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_categoryId_locale_key" ON "category_translations"("categoryId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_userId_key" ON "sellers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_storeSlug_key" ON "sellers"("storeSlug");

-- CreateIndex
CREATE INDEX "sellers_latitude_longitude_idx" ON "sellers"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "seller_verifications_businessId_key" ON "seller_verifications"("businessId");

-- CreateIndex
CREATE INDEX "seller_verifications_businessId_idx" ON "seller_verifications"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_categoryId_idx" ON "products"("categoryId");

-- CreateIndex
CREATE INDEX "products_businessId_idx" ON "products"("businessId");

-- CreateIndex
CREATE INDEX "products_businessId_isPublished_isApproved_createdAt_idx" ON "products"("businessId", "isPublished", "isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "products_totalSales_idx" ON "products"("totalSales");

-- CreateIndex
CREATE INDEX "products_isPublished_isApproved_idx" ON "products"("isPublished", "isApproved");

-- CreateIndex
CREATE INDEX "products_isPublished_isApproved_createdAt_idx" ON "products"("isPublished", "isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "products_categoryId_isPublished_isApproved_createdAt_idx" ON "products"("categoryId", "isPublished", "isApproved", "createdAt");

-- CreateIndex
CREATE INDEX "product_translations_locale_idx" ON "product_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_productId_locale_key" ON "product_translations"("productId", "locale");

-- CreateIndex
CREATE INDEX "orders_customerId_idx" ON "orders"("customerId");

-- CreateIndex
CREATE INDEX "orders_businessId_status_createdAt_idx" ON "orders"("businessId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_locationId_status_createdAt_idx" ON "orders"("locationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "payouts_sellerId_status_idx" ON "payouts"("sellerId", "status");

-- CreateIndex
CREATE INDEX "ledger_entries_sellerId_idx" ON "ledger_entries"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "suggestion_votes_suggestionId_userId_key" ON "suggestion_votes"("suggestionId", "userId");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "reports_reporterId_idx" ON "reports"("reporterId");

-- CreateIndex
CREATE INDEX "support_tickets_status_assignedTo_idx" ON "support_tickets"("status", "assignedTo");

-- CreateIndex
CREATE INDEX "support_tickets_category_createdAt_idx" ON "support_tickets"("category", "createdAt");

-- CreateIndex
CREATE INDEX "support_tickets_customerId_createdAt_idx" ON "support_tickets"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "product_options_productId_sortOrder_idx" ON "product_options"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_options_productId_name_key" ON "product_options"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "product_option_translations_optionId_locale_key" ON "product_option_translations"("optionId", "locale");

-- CreateIndex
CREATE INDEX "product_option_values_optionId_sortOrder_idx" ON "product_option_values"("optionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_option_values_optionId_value_key" ON "product_option_values"("optionId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "product_option_value_translations_optionValueId_locale_key" ON "product_option_value_translations"("optionValueId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_productId_isAvailable_idx" ON "product_variants"("productId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_translations_variantId_locale_key" ON "product_variant_translations"("variantId", "locale");

-- CreateIndex
CREATE INDEX "product_variant_values_optionValueId_idx" ON "product_variant_values"("optionValueId");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_values_variantId_optionValueId_key" ON "product_variant_values"("variantId", "optionValueId");

-- CreateIndex
CREATE INDEX "product_relations_sourceProductId_relationType_sortOrder_idx" ON "product_relations"("sourceProductId", "relationType", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_relations_sourceProductId_targetProductId_relationT_key" ON "product_relations"("sourceProductId", "targetProductId", "relationType");

-- CreateIndex
CREATE UNIQUE INDEX "business_profiles_slug_key" ON "business_profiles"("slug");

-- CreateIndex
CREATE INDEX "business_profiles_sellerId_isActive_idx" ON "business_profiles"("sellerId", "isActive");

-- CreateIndex
CREATE INDEX "business_profiles_country_city_isActive_idx" ON "business_profiles"("country", "city", "isActive");

-- CreateIndex
CREATE INDEX "business_profile_translations_locale_idx" ON "business_profile_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "business_profile_translations_businessId_locale_key" ON "business_profile_translations"("businessId", "locale");

-- CreateIndex
CREATE INDEX "business_memberships_userId_isActive_idx" ON "business_memberships"("userId", "isActive");

-- CreateIndex
CREATE INDEX "business_memberships_businessId_role_isActive_idx" ON "business_memberships"("businessId", "role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "business_memberships_businessId_userId_key" ON "business_memberships"("businessId", "userId");

-- CreateIndex
CREATE INDEX "business_locations_businessId_locationType_isActive_idx" ON "business_locations"("businessId", "locationType", "isActive");

-- CreateIndex
CREATE INDEX "business_locations_latitude_longitude_idx" ON "business_locations"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "business_locations_businessId_code_key" ON "business_locations"("businessId", "code");

-- CreateIndex
CREATE INDEX "business_location_translations_locale_idx" ON "business_location_translations"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "business_location_translations_locationId_locale_key" ON "business_location_translations"("locationId", "locale");

-- CreateIndex
CREATE INDEX "business_location_memberships_locationId_idx" ON "business_location_memberships"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "business_location_memberships_membershipId_locationId_key" ON "business_location_memberships"("membershipId", "locationId");

-- CreateIndex
CREATE INDEX "product_location_inventory_productId_isAvailable_idx" ON "product_location_inventory"("productId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "product_location_inventory_locationId_productId_key" ON "product_location_inventory"("locationId", "productId");

-- CreateIndex
CREATE INDEX "product_variant_location_inventory_variantId_isAvailable_idx" ON "product_variant_location_inventory"("variantId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_location_inventory_locationId_variantId_key" ON "product_variant_location_inventory"("locationId", "variantId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_profiles_businessId_key" ON "restaurant_profiles"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_profile_translations_restaurantId_locale_key" ON "restaurant_profile_translations"("restaurantId", "locale");

-- CreateIndex
CREATE INDEX "restaurant_menu_categories_restaurantId_isActive_sortOrder_idx" ON "restaurant_menu_categories"("restaurantId", "isActive", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_menu_category_translations_categoryId_locale_key" ON "restaurant_menu_category_translations"("categoryId", "locale");

-- CreateIndex
CREATE INDEX "restaurant_menu_items_categoryId_isAvailable_idx" ON "restaurant_menu_items"("categoryId", "isAvailable");

-- CreateIndex
CREATE INDEX "restaurant_menu_item_locations_locationId_isAvailable_idx" ON "restaurant_menu_item_locations"("locationId", "isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_menu_item_locations_menuItemId_locationId_key" ON "restaurant_menu_item_locations"("menuItemId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_menu_item_translations_menuItemId_locale_key" ON "restaurant_menu_item_translations"("menuItemId", "locale");

-- CreateIndex
CREATE INDEX "restaurant_orders_restaurantId_status_createdAt_idx" ON "restaurant_orders"("restaurantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "restaurant_orders_locationId_status_createdAt_idx" ON "restaurant_orders"("locationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "restaurant_orders_customerId_createdAt_idx" ON "restaurant_orders"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "reservations_restaurantId_startsAt_status_idx" ON "reservations"("restaurantId", "startsAt", "status");

-- CreateIndex
CREATE INDEX "reservations_locationId_startsAt_status_idx" ON "reservations"("locationId", "startsAt", "status");

-- CreateIndex
CREATE INDEX "reservations_customerId_startsAt_idx" ON "reservations"("customerId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_partners_userId_key" ON "delivery_partners"("userId");

-- CreateIndex
CREATE INDEX "delivery_partners_status_isVerified_idx" ON "delivery_partners"("status", "isVerified");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_jobs_orderId_key" ON "delivery_jobs"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_jobs_restaurantOrderId_key" ON "delivery_jobs"("restaurantOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_jobs_businessOrderId_key" ON "delivery_jobs"("businessOrderId");

-- CreateIndex
CREATE INDEX "delivery_jobs_partnerId_status_idx" ON "delivery_jobs"("partnerId", "status");

-- CreateIndex
CREATE INDEX "delivery_jobs_status_createdAt_idx" ON "delivery_jobs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "delivery_status_history_deliveryJobId_createdAt_idx" ON "delivery_status_history"("deliveryJobId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_profiles_businessId_key" ON "supplier_profiles"("businessId");

-- CreateIndex
CREATE INDEX "supplier_retailers_retailerId_isApproved_idx" ON "supplier_retailers"("retailerId", "isApproved");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_retailers_supplierId_retailerId_key" ON "supplier_retailers"("supplierId", "retailerId");

-- CreateIndex
CREATE INDEX "wholesale_prices_productId_minQuantity_idx" ON "wholesale_prices"("productId", "minQuantity");

-- CreateIndex
CREATE INDEX "wholesale_prices_businessId_idx" ON "wholesale_prices"("businessId");

-- CreateIndex
CREATE INDEX "supply_orders_supplierBusinessId_status_idx" ON "supply_orders"("supplierBusinessId", "status");

-- CreateIndex
CREATE INDEX "supply_orders_retailerUserId_createdAt_idx" ON "supply_orders"("retailerUserId", "createdAt");

-- CreateIndex
CREATE INDEX "supply_orders_retailerLocationId_idx" ON "supply_orders"("retailerLocationId");

-- CreateIndex
CREATE INDEX "supply_orders_supplierLocationId_idx" ON "supply_orders"("supplierLocationId");

-- CreateIndex
CREATE INDEX "request_for_quotations_businessId_status_createdAt_idx" ON "request_for_quotations"("businessId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "supplier_quotations_supplierId_createdAt_idx" ON "supplier_quotations"("supplierId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_quotations_rfqId_supplierId_key" ON "supplier_quotations"("rfqId", "supplierId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_quotation_items_quotationId_rfqItemId_key" ON "supplier_quotation_items"("quotationId", "rfqItemId");

-- CreateIndex
CREATE INDEX "business_orders_buyerBusinessId_status_idx" ON "business_orders"("buyerBusinessId", "status");

-- CreateIndex
CREATE INDEX "business_orders_supplierBusinessId_status_idx" ON "business_orders"("supplierBusinessId", "status");

-- CreateIndex
CREATE INDEX "business_orders_buyerLocationId_idx" ON "business_orders"("buyerLocationId");

-- CreateIndex
CREATE INDEX "business_orders_supplierLocationId_idx" ON "business_orders"("supplierLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "support_knowledge_articles_slug_key" ON "support_knowledge_articles"("slug");

-- CreateIndex
CREATE INDEX "support_knowledge_articles_status_locale_category_idx" ON "support_knowledge_articles"("status", "locale", "category");

-- CreateIndex
CREATE INDEX "support_knowledge_chunks_articleId_idx" ON "support_knowledge_chunks"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "support_knowledge_chunks_articleId_chunkNo_key" ON "support_knowledge_chunks"("articleId", "chunkNo");

-- CreateIndex
CREATE UNIQUE INDEX "ai_chat_sessions_sessionKey_key" ON "ai_chat_sessions"("sessionKey");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_userId_updatedAt_idx" ON "ai_chat_sessions"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_locale_updatedAt_idx" ON "ai_chat_sessions"("locale", "updatedAt");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_purpose_updatedAt_idx" ON "ai_chat_sessions"("purpose", "updatedAt");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_supportTicketId_idx" ON "ai_chat_sessions"("supportTicketId");

-- CreateIndex
CREATE INDEX "ai_chat_messages_sessionId_createdAt_idx" ON "ai_chat_messages"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_chat_messages_referencedProductId_idx" ON "ai_chat_messages"("referencedProductId");

-- CreateIndex
CREATE INDEX "ai_chat_messages_role_createdAt_idx" ON "ai_chat_messages"("role", "createdAt");

-- CreateIndex
CREATE INDEX "ai_product_recommendations_userId_source_createdAt_idx" ON "ai_product_recommendations"("userId", "source", "createdAt");

-- CreateIndex
CREATE INDEX "ai_product_recommendations_sessionId_createdAt_idx" ON "ai_product_recommendations"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_product_recommendations_source_createdAt_idx" ON "ai_product_recommendations"("source", "createdAt");

-- CreateIndex
CREATE INDEX "ai_product_recommendations_expiresAt_idx" ON "ai_product_recommendations"("expiresAt");

-- CreateIndex
CREATE INDEX "ai_product_recommendation_items_productId_createdAt_idx" ON "ai_product_recommendation_items"("productId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ai_product_recommendation_items_recommendationId_productId_key" ON "ai_product_recommendation_items"("recommendationId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ai_product_recommendation_items_recommendationId_rank_key" ON "ai_product_recommendation_items"("recommendationId", "rank");

-- CreateIndex
CREATE INDEX "ai_recommendation_events_productId_eventType_createdAt_idx" ON "ai_recommendation_events"("productId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "ai_recommendation_events_userId_eventType_createdAt_idx" ON "ai_recommendation_events"("userId", "eventType", "createdAt");

-- CreateIndex
CREATE INDEX "ai_recommendation_events_recommendationId_eventType_idx" ON "ai_recommendation_events"("recommendationId", "eventType");

-- CreateIndex
CREATE INDEX "ai_recommendation_events_sessionKey_createdAt_idx" ON "ai_recommendation_events"("sessionKey", "createdAt");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellers" ADD CONSTRAINT "sellers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_verifications" ADD CONSTRAINT "seller_verifications_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion_votes" ADD CONSTRAINT "suggestion_votes_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "suggestions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion_votes" ADD CONSTRAINT "suggestion_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_translations" ADD CONSTRAINT "product_option_translations_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_translations" ADD CONSTRAINT "product_option_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "product_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_value_translations" ADD CONSTRAINT "product_option_value_translations_optionValueId_fkey" FOREIGN KEY ("optionValueId") REFERENCES "product_option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_option_value_translations" ADD CONSTRAINT "product_option_value_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_translations" ADD CONSTRAINT "product_variant_translations_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_translations" ADD CONSTRAINT "product_variant_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_values" ADD CONSTRAINT "product_variant_values_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_values" ADD CONSTRAINT "product_variant_values_optionValueId_fkey" FOREIGN KEY ("optionValueId") REFERENCES "product_option_values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_relations" ADD CONSTRAINT "product_relations_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profile_translations" ADD CONSTRAINT "business_profile_translations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_profile_translations" ADD CONSTRAINT "business_profile_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_memberships" ADD CONSTRAINT "business_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_locations" ADD CONSTRAINT "business_locations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_location_translations" ADD CONSTRAINT "business_location_translations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_location_translations" ADD CONSTRAINT "business_location_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_location_memberships" ADD CONSTRAINT "business_location_memberships_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "business_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_location_memberships" ADD CONSTRAINT "business_location_memberships_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_location_inventory" ADD CONSTRAINT "product_location_inventory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_location_inventory" ADD CONSTRAINT "product_location_inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_location_inventory" ADD CONSTRAINT "product_variant_location_inventory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_location_inventory" ADD CONSTRAINT "product_variant_location_inventory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_profiles" ADD CONSTRAINT "restaurant_profiles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_profile_translations" ADD CONSTRAINT "restaurant_profile_translations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_profile_translations" ADD CONSTRAINT "restaurant_profile_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_categories" ADD CONSTRAINT "restaurant_menu_categories_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_category_translations" ADD CONSTRAINT "restaurant_menu_category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "restaurant_menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_category_translations" ADD CONSTRAINT "restaurant_menu_category_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_items" ADD CONSTRAINT "restaurant_menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "restaurant_menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_item_locations" ADD CONSTRAINT "restaurant_menu_item_locations_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "restaurant_menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_item_locations" ADD CONSTRAINT "restaurant_menu_item_locations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_item_translations" ADD CONSTRAINT "restaurant_menu_item_translations_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "restaurant_menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_menu_item_translations" ADD CONSTRAINT "restaurant_menu_item_translations_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_orders" ADD CONSTRAINT "restaurant_orders_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_orders" ADD CONSTRAINT "restaurant_orders_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_orders" ADD CONSTRAINT "restaurant_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_order_items" ADD CONSTRAINT "restaurant_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "restaurant_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurant_order_items" ADD CONSTRAINT "restaurant_order_items_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "restaurant_menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "business_locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_partners" ADD CONSTRAINT "delivery_partners_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_jobs" ADD CONSTRAINT "delivery_jobs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_jobs" ADD CONSTRAINT "delivery_jobs_restaurantOrderId_fkey" FOREIGN KEY ("restaurantOrderId") REFERENCES "restaurant_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_jobs" ADD CONSTRAINT "delivery_jobs_businessOrderId_fkey" FOREIGN KEY ("businessOrderId") REFERENCES "business_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_jobs" ADD CONSTRAINT "delivery_jobs_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "delivery_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_status_history" ADD CONSTRAINT "delivery_status_history_deliveryJobId_fkey" FOREIGN KEY ("deliveryJobId") REFERENCES "delivery_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_profiles" ADD CONSTRAINT "supplier_profiles_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_retailers" ADD CONSTRAINT "supplier_retailers_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_retailers" ADD CONSTRAINT "supplier_retailers_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wholesale_prices" ADD CONSTRAINT "wholesale_prices_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wholesale_prices" ADD CONSTRAINT "wholesale_prices_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_orders" ADD CONSTRAINT "supply_orders_retailerUserId_fkey" FOREIGN KEY ("retailerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_orders" ADD CONSTRAINT "supply_orders_retailerBusinessId_fkey" FOREIGN KEY ("retailerBusinessId") REFERENCES "business_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_orders" ADD CONSTRAINT "supply_orders_supplierBusinessId_fkey" FOREIGN KEY ("supplierBusinessId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_orders" ADD CONSTRAINT "supply_orders_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "supplier_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_orders" ADD CONSTRAINT "supply_orders_retailerLocationId_fkey" FOREIGN KEY ("retailerLocationId") REFERENCES "business_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_orders" ADD CONSTRAINT "supply_orders_supplierLocationId_fkey" FOREIGN KEY ("supplierLocationId") REFERENCES "business_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_order_items" ADD CONSTRAINT "supply_order_items_supplyOrderId_fkey" FOREIGN KEY ("supplyOrderId") REFERENCES "supply_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supply_order_items" ADD CONSTRAINT "supply_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_for_quotations" ADD CONSTRAINT "request_for_quotations_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_for_quotations" ADD CONSTRAINT "request_for_quotations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "request_for_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_items" ADD CONSTRAINT "rfq_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotations" ADD CONSTRAINT "supplier_quotations_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "request_for_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotations" ADD CONSTRAINT "supplier_quotations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "business_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotation_items" ADD CONSTRAINT "supplier_quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES "supplier_quotations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_quotation_items" ADD CONSTRAINT "supplier_quotation_items_rfqItemId_fkey" FOREIGN KEY ("rfqItemId") REFERENCES "rfq_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_buyerUserId_fkey" FOREIGN KEY ("buyerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_buyerBusinessId_fkey" FOREIGN KEY ("buyerBusinessId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_supplierBusinessId_fkey" FOREIGN KEY ("supplierBusinessId") REFERENCES "business_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_buyerLocationId_fkey" FOREIGN KEY ("buyerLocationId") REFERENCES "business_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_orders" ADD CONSTRAINT "business_orders_supplierLocationId_fkey" FOREIGN KEY ("supplierLocationId") REFERENCES "business_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_order_items" ADD CONSTRAINT "business_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "business_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_order_items" ADD CONSTRAINT "business_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_knowledge_articles" ADD CONSTRAINT "support_knowledge_articles_locale_fkey" FOREIGN KEY ("locale") REFERENCES "locales"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_knowledge_chunks" ADD CONSTRAINT "support_knowledge_chunks_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "support_knowledge_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "ai_chat_sessions_supportTicketId_fkey" FOREIGN KEY ("supportTicketId") REFERENCES "support_tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_referencedProductId_fkey" FOREIGN KEY ("referencedProductId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_product_recommendations" ADD CONSTRAINT "ai_product_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_product_recommendations" ADD CONSTRAINT "ai_product_recommendations_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ai_chat_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_product_recommendation_items" ADD CONSTRAINT "ai_product_recommendation_items_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "ai_product_recommendations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_product_recommendation_items" ADD CONSTRAINT "ai_product_recommendation_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation_events" ADD CONSTRAINT "ai_recommendation_events_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "ai_product_recommendations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation_events" ADD CONSTRAINT "ai_recommendation_events_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation_events" ADD CONSTRAINT "ai_recommendation_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation_events" ADD CONSTRAINT "ai_recommendation_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_recommendation_events" ADD CONSTRAINT "ai_recommendation_events_businessOrderId_fkey" FOREIGN KEY ("businessOrderId") REFERENCES "business_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
