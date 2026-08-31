export interface RegistrationPlan {
  name: string;
  price: number;
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
    },
    {
      name: "Monthly",
      price: 1800,
    },
  ],

  2: [
    {
      name: "Weekly",
      price: 600,
    },
    {
      name: "Monthly",
      price: 2000,
    },
  ],

  3: [
    {
      name: "Weekly",
      price: 700,
    },
    {
      name: "Monthly",
      price: 2200,
    },
  ],

  4: [
    {
      name: "Weekly",
      price: 800,
    },
    {
      name: "Monthly",
      price: 2400,
    },
  ],

  5: [
  {
    name: "Weekly",
    price: 900,
  },
  {
    name: "Monthly",
    price: 2500,
  },
],
};