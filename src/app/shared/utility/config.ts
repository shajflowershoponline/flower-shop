import { AccessPages } from "src/app/model/access.model";

export interface AppConfig {
    appName: string;
    reservationConfig: {
      maxCancellation: string;
      daysCancellationLimitReset: string;
    };
    tableColumns: {
    };
    sessionConfig: {
      sessionTimeout: string;
    };
    lookup: {
      userCheckList: {
        passenger: string[];
        driver: string[];
        operator: string[];
      };
    };
    apiEndPoints: {
      auth: {
        loginPassenger: string;
        loginAdmin: string;
        loginDriver: string;
        loginOperator: string;
        registerPassenger: string;
        registerDriver: string;
        registerOperator: string;
      };
      users: {
        getByCode: string;
        createUsers: string;
        updateProfile: string;
        updateUsers: string;
        getUsersByAdvanceSearch: string;
        updatePassword: string;
        resetPassword: string;
        approveAccessRequest: string;
      };
      access: {
        getByAdvanceSearch: string;
        getByCode: string;
        create: string;
        update: string;
        delete: string;
      };
      passenger: {
        getByAdvanceSearch: string;
        getByCode: string;
        create: string;
        update: string;
        updateProfile: string;
        delete: string;
      };
      driver: {
        getByAdvanceSearch: string;
        getByCode: string;
        getWalletSummary: string;
        create: string;
        update: string;
        updateProfile: string;
        updateLocation: string;
        delete: string;
      };
      operator: {
        getByAdvanceSearch: string;
        getByCode: string;
        create: string;
        update: string;
        updateProfile: string;
        delete: string;
      };
      booking: {
        getByAdvanceSearch: string;
        getByDriverDistance: string;
        getByCode: string;
        create: string;
        update: string;
        updateStatus: string;
        acceptBooking: string;
        sendFeedback: string;
        getDriverLocation: string;
      };
      notifications: {
        getByAdvanceSearch: string;
        getUnreadByUser: string;
        marAsRead: string;
      };
      wallet: {
        getByAdvanceSearch: string;
        requestPaymentId: string;
        getPaymentLink: string;
        requestPaymentLink: string;
        expirePaymentLink: string;
        comleteTopUpPayment: string;
      };
    };
    map: {
      marker: {
        me: {
          path: string;
        }
      }
    }
  }
