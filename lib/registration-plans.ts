export interface RegistrationPlan {
  name: string;
  price: number;
  ending:
    | {
        type: "offset";
        days: number;
      }
    | {
        type: "date";
        date: string;
      };
}

export type AcademicYear = number;

export const REGISTRATION_PLANS: Record<
  AcademicYear,
  RegistrationPlan[]
> = {
  1: [
    {
      name: "Weekly",
      price: 500,
      ending: {
        type: "offset",
        days: 7,
      },
    },
    {
      name: "Monthly",
      price: 1800,
      ending: {
        type: "offset",
        days: 30,
      },
    },
  ],

  2: [
    {
      name: "Weekly",
      price: 600,
      ending: {
        type: "offset",
        days: 7,
      },
    },
    {
      name: "Monthly",
      price: 2000,
      ending: {
        type: "offset",
        days: 30,
      },
    },
  ],

  3: [
    {
      name: "Weekly",
      price: 700,
      ending: {
        type: "offset",
        days: 7,
      },
    },
    {
      name: "Monthly",
      price: 2200,
      ending: {
        type: "offset",
        days: 30,
      },
    },
  ],

  4: [
    {
      name: "Weekly",
      price: 700,
      ending: {
        type: "offset",
        days: 7,
      },
    },
    {
      name: "Monthly",
      price: 2200,
      ending: {
        type: "offset",
        days: 30,
      },
    },
  ],

    5: [
    {
      name: "Weekly",
      price: 700,
      ending: {
        type: "offset",
        days: 7,
      },
    },
    {
      name: "Monthly",
      price: 2200,
      ending: {
        type: "offset",
        days: 30,
      },
    },
  ],
};

