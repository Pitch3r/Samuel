import { describe, expect, it } from "vitest";
import { careersSchema, contactSchema, fieldErrorsFrom, newsletterSchema, proposalSchema, trainingSchema } from "@/lib/validation";

const validContact = {
  name: "Chanda Mwila",
  email: " Chanda@Example.com ",
  enquiryType: "General enquiry",
  message: "We would like to discuss a customer satisfaction survey.",
  consent: true,
};

describe("contactSchema", () => {
  it("accepts a valid enquiry and normalises the email", () => {
    const result = contactSchema.parse(validContact);
    expect(result.email).toBe("chanda@example.com");
    expect(result.phone).toBe("");
  });

  it("explains every problem in plain language", () => {
    const result = contactSchema.safeParse({ name: "A", email: "nope", enquiryType: "x", message: "hi", consent: false });
    expect(result.success).toBe(false);
    if (result.success) return;
    const errors = fieldErrorsFrom(result.error);
    expect(Object.keys(errors).sort()).toEqual(["consent", "email", "enquiryType", "message", "name"]);
    expect(errors.email).toBe("Please enter a valid email address.");
  });

  it("rejects phone numbers with letters", () => {
    expect(contactSchema.safeParse({ ...validContact, phone: "call me" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, phone: "+260 (97) 111-2222" }).success).toBe(true);
  });
});

describe("proposalSchema", () => {
  const valid = {
    goal: "Evaluate a programme",
    services: ["monitoring-evaluation"],
    decision: "Whether to scale the programme to two more districts.",
    geography: ["Eastern"],
    timeline: "1 to 3 months",
    clientType: "NGO or development partner",
    name: "Mutale Banda",
    email: "mutale@example.org",
    consent: true,
  };

  it("accepts a complete brief without the optional budget", () => {
    expect(proposalSchema.safeParse(valid).success).toBe(true);
  });

  it("requires at least one area and one location", () => {
    expect(proposalSchema.safeParse({ ...valid, services: [] }).success).toBe(false);
    expect(proposalSchema.safeParse({ ...valid, geography: [] }).success).toBe(false);
    expect(proposalSchema.safeParse({ ...valid, geography: ["Atlantis"] }).success).toBe(false);
  });
});

describe("trainingSchema", () => {
  it("coerces the participant count", () => {
    const result = trainingSchema.parse({
      course: "data-analysis-spss",
      format: "Live online",
      participants: "12",
      name: "Grace Phiri",
      email: "grace@example.com",
      consent: true,
    });
    expect(result.participants).toBe(12);
  });
});

describe("careersSchema", () => {
  const valid = {
    role: "Enumerator / field interviewer",
    provinces: ["Lusaka"],
    languages: ["English", "Nyanja"],
    education: "Bachelor's degree",
    experience: "1 to 3 years",
    statement: "I have conducted household interviews on two national surveys.",
    name: "Joseph Tembo",
    email: "joseph@example.com",
    phone: "0977000000",
    consent: true,
  };

  it("accepts a complete application", () => {
    expect(careersSchema.safeParse(valid).success).toBe(true);
  });

  it("only accepts full web links for CVs", () => {
    expect(careersSchema.safeParse({ ...valid, cvUrl: "drive.google.com/file" }).success).toBe(false);
    expect(careersSchema.safeParse({ ...valid, cvUrl: "https://drive.google.com/file" }).success).toBe(true);
  });
});

describe("newsletterSchema", () => {
  it("needs only an email address", () => {
    expect(newsletterSchema.safeParse({ email: "reader@example.com" }).success).toBe(true);
    expect(newsletterSchema.safeParse({ email: "reader" }).success).toBe(false);
  });
});
