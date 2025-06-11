export const environment = {
  appName: "Shaj Flower shop",
  production: true,
  oneSignalAppId: "09c8c0ed-5d53-42f9-8384-c66c217bd87e",
  apiBaseUrl: "https://shaj-flower-shop-api-eight.vercel.app/api/v1",
  autocompleteAIApiBaseUrl: "https://autocomplete-ai.vercel.app",
  googleMapsApiKey: 'AIzaSyBOOxySuCv1jJ1M7QXZ3VPX_LfAcu4pgXA',
  api: {
    auth: {
      login: "/auth/login/customer/",
      registerCustomer: "/auth/register/customer/",
      registerVerify: "/auth/register/verifyCustomer/",
      resetSubmit: "/auth/reset/customerUserResetPasswordSubmit/",
      resetVerify: "/auth/reset/customerUserVerify/",
      resetPassword: "/auth/reset/customerUserResetPassword/",
    },
    users: {
      getByCode: "/customer-user/",
      updateProfile: "/customer-user/updateProfile/"
    },
    cart: {
      getItems: "/cart/getItems/",
      create: "/cart/",
      update: "/cart/",
      manageCoupon: "/cart/coupon",
      getActiveCoupon: "/cart/customerUserCoupon/",
    },
    systemConfig: {
      getAll: "/system-config/"
    },
    geolocation: {
      searchAddress: "/geolocation/search/"
    },
    order: {
      getAdvanceSearch: "/order/my-orders/",
      getByCode: "/order/",
      create: "/order/",
      updateStatus: "/order/status/",
    },
    delivery: {
      calculate: "/delivery/calculate/"
    },
    category: {
      getAdvanceSearch: "/category/page/",
      getByCode: "/category/",
    },
    collection: {
      getAdvanceSearch: "/collection/page/",
      getByCode: "/collection/",
    },
    product: {
      getAdvanceSearch: "/product/page/",
      getClientPagination: "/product/client-pagination/",
      getSearchFilter: "/product/get-search-filter/",
      getByCode: "/product/",
      getAllFeaturedProducts: "/product/featured/",
    },
    customerUserWishlist: {
      getAdvanceSearch: "/customer-user-wish-list/page/",
      getByCode: "/customer-user-wish-list/",
      getBySKU: "/customer-user-wish-list/get-by-sku/",
      create: "/customer-user-wish-list/",
      delete: "/customer-user-wish-list/",
    },
    discounts: {
      getAdvanceSearch: "/product/page/",
      getByCode: "/product/",
      create: "/product/",
    },
    email: {
      sendEmailFromContact: "/email/send/"
    },
    autocompleteAI: {
      search: "/suggest/"
    },
    aiSearch: {
      search: "/ai/search",
    }
  }
};
