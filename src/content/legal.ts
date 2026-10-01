import { site } from "@/config/site";

/*
 * Website privacy notice and terms of use. These are a careful starting point
 * written for a Zambian research firm; have them reviewed by a qualified legal
 * adviser before launch.
 */

export const legalUpdated = "2026-10-01";

const address = `${site.contact.address.street}, ${site.contact.address.city}, ${site.contact.address.country}`;

export const privacyNotice = `
## Who we are

${site.name} ("Primeresearch", "we" or "us") is a research and advisory firm registered in Zambia. We are responsible, as data controller, for the personal data collected through this website. You can contact us at ${site.contact.email} or write to us at ${address}.

## What this notice covers

This notice explains how we handle personal data collected through this website: enquiries, proposal requests, training enquiries, field network applications and newsletter subscriptions.

People who take part in our research studies receive a separate information sheet for each study. It explains who is conducting the research, how their answers will be used and how their confidentiality is protected.

## The information we collect

- **Details you give us.** Your name, email address, phone number, organisation and role, and anything you write in our forms.
- **Field network applications.** The provinces where you can work, the languages you speak, your qualifications and experience, and any link to a CV or profile that you choose to share.
- **Security information.** When you submit a form we store a one-way hash of your IP address and your browser type, so that we can detect abuse without keeping the address itself.

## Cookies and local storage

This website does not use advertising or analytics cookies, and we do not track you across other websites. One strictly necessary cookie keeps authorised staff signed in to the website's administration area.

If you start a proposal request, your answers are saved in your own browser so that you do not lose them. They stay on your device until you send the request or clear your browser data.

## How we use your information

| Purpose | Lawful basis |
| --- | --- |
| Responding to enquiries and preparing proposals | Your consent, and steps you ask us to take before entering into a contract |
| Considering field network applications | Your consent |
| Sending our newsletter | Your consent, which you can withdraw at any time |
| Keeping the website secure and free of spam | Our legitimate interest in protecting our services |
| Keeping records the law requires | Compliance with our legal obligations |

We process personal data in line with the Data Protection Act No. 3 of 2021 of the Republic of Zambia.

## Who we share it with

We do not sell personal data. We share it only with service providers who help us run this website and send email, such as our hosting and email providers, under terms that require them to protect it and use it only on our instructions. We may also disclose information where the law requires us to.

## Transfers outside Zambia

Some of our service providers may store or process data outside Zambia. Where that happens, we take steps to make sure your data receives a level of protection consistent with Zambian law.

## How long we keep it

- **Enquiries and proposal requests:** up to 24 months after our last contact. If we go on to work together, project records are kept for as long as the law requires.
- **Field network applications:** up to 24 months, or until you ask us to delete them.
- **Newsletter subscriptions:** until you unsubscribe.
- **Security information:** up to 12 months.

## How we protect it

Access to personal data is limited to authorised staff. The website uses encrypted connections, the administration area is password protected, and data is stored on secured systems.

## Your rights

Under the Data Protection Act No. 3 of 2021 you may ask us to:

- give you a copy of the personal data we hold about you;
- correct information that is inaccurate or incomplete;
- delete your personal data;
- restrict or object to certain uses of your data;
- stop sending you marketing, including our newsletter.

Where we rely on your consent, you can withdraw it at any time. To exercise any of these rights, email ${site.contact.email}. We will respond within the time the law allows.

If you are unhappy with how we have handled your data, please tell us so that we can put it right. You also have the right to complain to the Office of the Data Protection Commissioner of Zambia.

## Children

This website is intended for adults. We do not knowingly collect personal data from children through it.

## Changes to this notice

We may update this notice from time to time. The date at the top of the page shows when it was last changed.

## Contact

Questions about this notice or your data: ${site.contact.email}, ${site.contact.phone}, ${address}.
`;

export const termsOfUse = `
## About these terms

These terms apply to your use of this website, operated by ${site.name}, a research and advisory firm registered in Zambia. By using the website you agree to them. If you do not agree, please do not use the website.

## Information on this website

The articles, guides and other content on this website are general information about research methods and our services. They are not professional advice for your particular situation. When we work with you, the scope, deliverables and terms of the engagement are set out in a written proposal or contract, and those documents take precedence over anything on this website.

## The sample size calculator

The calculator gives estimates based on standard formulas for simple and clustered random samples. It is provided free, for guidance only, and without any warranty. Real studies often need further adjustments for stratification, subgroup analysis, weighting and non-response, so please seek expert advice before finalising a sample design.

## Using the website responsibly

Please do not misuse the website, for example by attempting to gain unauthorised access, submitting false or automated information through our forms, or interfering with its security or performance.

## Intellectual property

The content, design, logos and trade marks on this website belong to ${site.name} unless stated otherwise. You may share links to our pages and quote short extracts from our articles with clear attribution and a link to the original. Please contact us for permission for any other use.

Province boundaries on our coverage map are derived from geoBoundaries data, licensed under Creative Commons Attribution 4.0.

## Links to other websites

Where we link to other websites, we do so for your convenience. We are not responsible for their content or their privacy practices.

## Liability

We take care to keep the website accurate and available, but we cannot guarantee that it will always be complete, current or uninterrupted. To the extent permitted by law, we are not liable for any loss arising from your use of, or reliance on, the website. Nothing in these terms limits any liability that cannot be limited by law.

## Privacy

Our privacy notice explains how we handle personal data collected through this website.

## Governing law

These terms are governed by the laws of the Republic of Zambia, and the courts of Zambia have jurisdiction over any dispute arising from them.

## Changes to these terms

We may update these terms from time to time. The date at the top of the page shows when they were last changed.

## Contact

Questions about these terms: ${site.contact.email} or ${site.contact.phone}.
`;
