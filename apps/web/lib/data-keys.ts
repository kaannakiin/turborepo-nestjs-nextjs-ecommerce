export const DataKeys = {
  auth: {
    signIn: 'auth_signIn',
    signOut: 'auth_signOut',
    signUp: 'auth_signUp',
    forgotPassword: 'auth_forgot_password',
    resetPassword: 'auth_reset_password',
    verifyEmail: 'auth_verify_email',
    resendVerificationEmail: 'auth_resend_verification_email',
  },
  cart: {
    get: ['cart'] as const,
    add: 'cart_add',
    remove: 'cart_remove',
    increase: 'cart_increase',
    decrease: 'cart_decrease',
    clear: 'cart_clear',
    updateContext: 'cart_update_context',
  },
  locations: {
    countries: ['locations', 'countries'] as const,
    states: (countryId: string) => ['locations', 'states', countryId] as const,
    cities: (countryId: string) => ['locations', 'cities', countryId] as const,
    districts: (countryId: string, cityId: string) =>
      ['locations', 'districts', countryId, cityId] as const,
  },
  admin: {
    customerGroups: {
      key: 'customer-groups' as const,
      list: (page: number, limit: number, search?: string) =>
        ['customer-groups', page, limit, search] as const,
      detail: (segmentId: string) => ['customer-group', segmentId] as const,
      all: ['all-customer-groups'] as const,
      create: 'customer-group-create',
    },
    customers: {
      key: 'customers' as const,
      list: (page: number, limit: number, search?: string, sortBy?: string) =>
        ['customers', page, limit, search, sortBy] as const,
    },

    brands: {
      key: 'admin-brands' as const,
      list: (search?: string, page: number = 1) =>
        ['admin-brands', search, page] as const,
      detail: (brandId: string) => ['admin-brand-form', brandId] as const,
      createOrUpdate: 'admin-brand-create-update',
      uploadImage: 'admin-brand-upload-image',
      deleteImage: 'admin-brand-delete-image',
      delete: 'admin-brand-delete',
      allSimple: ['data-select-brands'] as const,
    },

    categories: {
      key: 'categories' as const,
      parentKey: 'parentCategories' as const,
      list: (search: string, page: number, limit: number) =>
        ['categories', search, page, limit] as const,
      parents: (currentCategoryId?: string) =>
        ['parentCategories', currentCategoryId] as const,
      detail: (categoryId: string) =>
        ['admin-category-form', categoryId] as const,
      createOrUpdate: 'admin-category-create-update',
      uploadImage: 'admin-category-upload-image',
      deleteImage: 'admin-category-delete-image',
      delete: 'admin-category-delete',
      allSimple: ['data-select-categories'] as const,
    },

    products: {
      key: 'admin-products' as const,
      list: (search?: string, page: number = 1) =>
        ['admin-products', search, page] as const,
      detail: (slug: string) => ['admin-product', slug] as const,
      variants: ['variants'] as const,
      googleTaxonomy: ['googleTaxonomyCategoriesNoRoot'] as const,
      createBasic: 'admin-product-create-basic',
      createVariant: 'admin-product-create-variant',
      uploadImage: 'admin-product-upload-image',
      uploadVariantFile: 'admin-variant-file-upload',
      deleteAsset: 'admin-product-delete-asset',
      deleteOptionAsset: 'admin-option-asset-delete',
      bulkAction: 'admin-product-bulk-action',
    },

    store: {
      get: ['admin', 'store', 'get'] as const,
      upsert: ['admin', 'store', 'upsert'] as const,
    },

    inventory: {
      key: 'inventory' as const,
      list: (page: number, take: number, search?: string) =>
        ['inventory', 'list', { page, take, search }] as const,
      detail: (id: string) => ['inventory', 'detail', id] as const,
      upsert: ['inventory', 'upsert'],
    },
  },

  // New keys added for refactoring
  googleTaxonomy: {
    categories: (parentId: string | null) =>
      ['google-taxonomy', parentId ?? 'root'] as const,
    details: (id: string) => ['google-taxonomy-details', id] as const,
    ancestors: (id: string) => ['google-taxonomy-ancestors', id] as const,
    search: (term: string) => ['google-taxonomy-search', term] as const,
  },
  payments: {
    methods: ['admin-payment-methods'] as const,
    method: (provider: string) => ['adminPaymentMethod', provider] as const,
  },
  shipping: {
    zones: (page = 1, limit = 10, search?: string) =>
      ['get-all-cargo-zones', page, limit, search] as const,
    createOrUpdate: 'create-or-update-cargo-zone',
    zone: (id: string) => ['get-cargo-zone', id] as const,
  },
  paymentRules: {
    key: 'payment-rules' as const,
    list: (page = 1, limit = 10) => ['payment-rules', page, limit] as const,
    detail: (id: string) => ['payment-rule', id] as const,
    create: 'payment-rule-create',
    update: 'payment-rule-update',
    delete: 'payment-rule-delete',
  },
  campaigns: {
    list: (search?: string, type?: string, page?: number) =>
      ['admin-campaigns', { search, type, page }] as const,
    detail: (slug: string) => ['admin-campaign-form', slug] as const,
  },
  discounts: {
    list: (type?: string, page?: number) =>
      ['admin-discounts', { type, page }] as const,
    conditionData: (type: string) => ['discount-data', type] as const,
    detail: (slug: string) => ['get-admin-discount', slug] as const,
  },
  users: {
    selectable: (page: number, search: string) =>
      ['selectable-user-modal-users', page, search] as const,
    all: ['all-users'] as const,
  },
  products: {
    upsellPreview: (id: string) =>
      ['product-variant-admin-overview-upsell-card-data', { id }] as const,
    searchableModal: (search: string) =>
      ['searchable-products-modal-data', { search }] as const,
    selectableModal: (page: number, limit: number, search: string) =>
      ['selectable-products-modal', { page, limit, search }] as const,
    detail: (slug: string) => ['product', slug] as const,
    similar: (id: string) => ['products', 'similar-products', id] as const,
    themeCarousel: (
      componentId: string,
      productIds: string[],
      variantIds: string[],
    ) =>
      [
        'theme-carousel',
        { componentId, p: productIds, v: variantIds },
      ] as const,
  },
} as const;
