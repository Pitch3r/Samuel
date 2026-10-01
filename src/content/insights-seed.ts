export type SeedArticle = {
  slug: string;
  title: string;
  excerpt: string; // 1 to 2 sentences, max 200 characters
  category: "Methods" | "Fieldwork" | "Evaluation" | "Analysis" | "Reporting" | "Academic";
  author: string; // always "Primeresearch Consultants"
  publishedAt: string; // ISO date (YYYY-MM-DD)
  featured: boolean; // true for the first article only
  body: string; // Markdown
};

export const seedArticles: SeedArticle[] = [
  {
    slug: "how-to-choose-a-sample-size",
    title: "How to choose the right sample size for your survey",
    excerpt:
      "How many people do you need to interview? A plain guide to margin of error, confidence, design effect and non-response, with worked numbers you can check.",
    category: "Methods",
    author: "Primeresearch Consultants",
    publishedAt: "2026-09-01",
    featured: true,
    body: `"How many people do we need to interview?" is usually the first question on a survey project, and often the first number someone wants to cut. The answer depends on how precise you need to be, how the sample is drawn and which groups you need to report on.

## Start with the margin of error

The margin of error tells you how far your survey result could reasonably be from the true figure in the population. Suppose 60% of your sample say they are satisfied with a service, and the margin of error is ±5 percentage points. The true figure is likely to lie between 55% and 65%.

Precision gets expensive quickly. Halving the margin of error roughly quadruples the sample, and each extra point of precision costs more interviews than the one before. So ask what the decision really needs. A choice between two clearly different options may be fine at ±5%. Tracking a small change over time needs much tighter estimates.

## Choose a confidence level

The confidence level is how sure you want to be that the true value falls inside your margin of error. 95% is the usual standard. It means that if you repeated the survey many times, about 95 in every 100 samples would produce a range containing the true value. Each level has a matching z-score for the calculation: 1.645 for 90%, 1.96 for 95% and 2.576 for 99%. Moving from 95% to 99% adds nearly three-quarters to the sample, so keep it for decisions where being wrong would be costly.

## Use p = 0.5 unless you know better

The formula also needs an estimate of the answer you expect, called the response distribution and written as p. A 50/50 split has the most variability, so it needs the largest sample. That makes p = 0.5 the cautious default: whatever the true split, your sample will be large enough.

If reliable earlier data puts the figure nearer 20% or 80%, you can use that: at 95% confidence and ±5%, p = 0.2 needs about 246 interviews instead of 385. But most surveys ask many questions with different splits, so p = 0.5 is usually the safer basis.

## The formula in words

For a large population, the starting sample size is the z-score squared, multiplied by p, multiplied by one minus p, all divided by the margin of error squared.

As a formula: **n = z² × p × (1 - p) ÷ e²**

At 95% confidence, p = 0.5 and ±5%, that is 1.96 × 1.96 × 0.5 × 0.5 ÷ (0.05 × 0.05) = 384.16. Always round up, so the answer is 385.

| Margin of error | Sample needed (95% confidence, p = 0.5, large population) |
|---|---|
| ±10% | about 97 |
| ±5% | about 385 |
| ±3% | about 1,068 |
| ±2% | about 2,401 |

## Small populations: the finite population correction

These figures assume a large population. If you are surveying a defined group, such as the staff of one organisation or the members of a cooperative, your sample may be a sizeable share of everyone, and you need fewer interviews.

To apply the correction, divide the starting sample size by one plus (the starting sample size minus one, divided by the population size). For a population of 1,000 at ±5%, that is 384.16 ÷ (1 + 383.16 ÷ 1,000) = 277.7, so you need about 278. At ±3%, the same population needs about 517 rather than 1,068. A common rule of thumb is to apply the correction when the sample would be more than about 5% of the population.

## Clustered samples need a design effect

The formula assumes a simple random sample, where each person is chosen independently. Most face-to-face household surveys instead send interviewers to clusters, such as census enumeration areas, to complete several interviews in each. That saves travel, but people in the same area tend to be alike, so each extra interview adds less new information.

The design effect measures that loss. A design effect of 2 means your clustered sample is about as informative as a simple random sample half its size, so you double the number: 385 becomes 770. It grows with the number of interviews per cluster and with how alike people in a cluster are, so spreading interviews across more clusters keeps it down. If an earlier survey with a similar design reported its design effect, use that. If not, choose a cautious value and state it in your methods.

## Plan for the subgroups you will report on

The margin of error applies to whichever group you are analysing. Interview 385 people nationally and your ±5% holds for the national figure only. Each urban, rural or provincial slice carries a much wider margin.

So decide early which comparisons matter. For ±5% among urban and rural respondents separately, you need about 385 in each group. For ±5% in each of Zambia's ten provinces, you are looking at around 3,850 before any design effect or non-response. Small groups may need to be oversampled, then weighted in the analysis.

## Inflate for non-response

Not everyone you select will take part. Divide your target by the response rate you realistically expect, based on similar surveys, modes and areas. If you need 770 completed interviews and expect 80% of selected households to respond, plan to approach 963. Phone and online surveys often get lower response than face-to-face ones, so the adjustment can be large.

## Putting it together

1. Agree the margin of error and confidence level.
2. Calculate the starting sample, with p = 0.5 by default.
3. Apply the finite population correction if the population is small.
4. Multiply by the design effect for clustered samples.
5. Repeat for each subgroup you must report on.
6. Divide by the expected response rate.

Remember that the margin of error covers random sampling error only. No sample size fixes bias from an incomplete sampling frame, low response or badly worded questions.

> **Key takeaway:** the right sample size is the smallest one that answers your question with the precision the decision needs, for every group you plan to report on.

To try your own numbers, use our [sample size calculator](/tools/sample-size-calculator).

## Talk it through with us

If your design involves clusters, several subgroups or a tight budget, the trade-offs are worth discussing before fieldwork starts. [Tell us about your project](/start-a-project) and we will help you arrive at a sample size you can defend.`,
  },
  {
    slug: "choosing-a-data-collection-mode",
    title: "CAPI, CATI, online or SMS: choosing the right data collection mode",
    excerpt:
      "Each data collection mode reaches different people at a different cost. Here is how to match face-to-face, phone, web and SMS surveys to your respondents and your questions.",
    category: "Fieldwork",
    author: "Primeresearch Consultants",
    publishedAt: "2026-09-08",
    featured: false,
    body: `Once you know what you need to find out, the next choice is how to collect the answers. The mode shapes who you can reach, how long the questionnaire can be, what the work costs and how far you can trust the results. In Zambia, access to phones, the internet and passable roads varies a great deal from place to place, so the choice matters.

## The four modes at a glance

**CAPI** (computer-assisted personal interviewing) means an interviewer sits with the respondent and records answers on a tablet or phone. **CATI** (computer-assisted telephone interviewing) is the same idea over the phone, usually from a call centre. **Online surveys** are completed by respondents themselves through a link. **SMS surveys** send short questions by text message and collect the replies the same way.

| Factor | CAPI | CATI | Online | SMS |
|---|---|---|---|---|
| Who you can reach | Almost anyone you can travel to | People whose number you can get | Internet users | Phone users who read and text |
| Cost per interview | Highest | Moderate | Low | Low |
| Questionnaire length | Long | Short to medium | Short | A few questions |
| Literacy needed | No | No | Yes | Yes |
| Connectivity needed | None during the interview | Phone signal | Internet access | Phone signal |
| Best for | Representative household surveys, rural areas | Follow-ups, quick polls, business surveys | Staff, members, customers | Short, repeated pulse checks |

## Coverage: who can you actually reach?

Coverage comes first, because no analysis can rescue a sample that misses the people you care about.

Face-to-face interviewing has the widest reach. With an area-based sample, such as one drawn from census enumeration areas, interviewers can reach households whether or not anyone owns a phone, uses the internet or reads well. For a survey meant to represent a district, a province or the country, CAPI is usually the dependable choice.

Phone surveys reach only people whose numbers you can obtain, from an earlier face-to-face round, a customer list or random digit dialling. Phone ownership is usually lower in rural areas, and among older people and those on low incomes. Phones are often shared, too, so think about who answers and who is missing.

Online and SMS surveys narrow coverage further. They suit defined groups with known contact details, such as staff, members or customers, but not the general population, because the people they miss can differ in important ways from those they reach.

## Cost and speed

CAPI costs the most per completed interview, because transport, allowances, accommodation and supervision add up, especially where households are far apart. It is also the slowest mode, and in the rainy season some rural roads become hard to pass.

CATI removes travel and lets a small team complete many interviews a day. Online and SMS surveys cost least per response once set up, though you may need to budget for airtime incentives and for building a contact list.

Cheaper per interview is not always cheaper per useful answer. If a low-cost mode misses the people your decision depends on, the saving is a false economy.

## Data quality and questionnaire length

- **CAPI** handles long, complex questionnaires. The interviewer can explain and probe, and the tablet enforces skip logic and range checks. The risks are respondents giving answers they think are acceptable, and interviewers cutting corners. Good training and daily quality checks manage both.
- **CATI** suits shorter interviews. Attention drops faster on the phone and you cannot show cards or pictures, so aim for well under half an hour. Central monitoring of calls makes supervision easier.
- **Online** works best for short questionnaires designed for a small screen, with very clear wording, since no interviewer is there to help. People may answer sensitive questions more frankly, but some will rush or tick the same answer all the way down a list.
- **SMS** limits you to a few short, closed questions, each fitting in one message. It suits tracking one or two indicators over time, not anything that needs explanation.

## Literacy, language and connectivity

CAPI and CATI do not require respondents to read, because the interviewer reads each question aloud. That matters where many people are more at ease in Bemba, Nyanja, Tonga, Lozi or another local language than in English. With fluent interviewers, one questionnaire can be fielded in several languages. Whatever the mode, check translations through back-translation and pre-testing.

Online and SMS surveys need respondents who read comfortably in the survey language and can type replies, plus data bundles or at least a phone signal. CAPI tools, by contrast, can work offline and upload data later, which makes them practical in remote areas.

## Rural and urban Zambia

- **Rural areas:** face-to-face interviewing remains the most reliable route to a representative sample. Phone follow-ups work well once you have collected numbers in person, with consent, at an earlier round.
- **Towns and cities:** in Lusaka, Kitwe, Ndola and other towns, phone and internet access is generally higher, so CATI and online surveys become realistic for groups such as professionals, businesses and young adults. Face-to-face is still safer for a representative sample of all urban households.
- **Mixed designs:** a face-to-face baseline followed by phone check-ins is a common combination. Keep the questions identical and record which mode each answer came from, because the same question can draw different answers in different modes.

> **Key takeaway:** choose the mode that reaches the people your decision depends on, then design the questionnaire to suit it. Picking the cheapest mode first and hoping the right people answer rarely ends well.

## A quick way to decide

1. Who do you need to hear from, and do you have their contact details?
2. Do you need results for a whole population, or for a defined group?
3. How long and complex is the questionnaire?
4. Can your respondents read the questions, and in which languages?
5. How quickly do you need results, and what can you spend?

If the answers conflict, a mixed-mode design may serve you best. Our [data collection and field services](/services/data-collection-field-services) team can help you weigh the options.

## Not sure which mode fits?

Tell us who you need to reach and what you need to know, and we will suggest a mode, or a mix of modes, that fits your budget and timeline. [Start a project](/start-a-project) or [get in touch](/contact).`,
  },
  {
    slug: "writing-a-research-question-that-leads-to-a-decision",
    title: "Start with the decision: writing a research question that leads somewhere",
    excerpt:
      "Good research starts with the decision you need to make. A simple five-part framework, with before and after examples, for writing research questions that lead somewhere.",
    category: "Methods",
    author: "Primeresearch Consultants",
    publishedAt: "2026-09-15",
    featured: false,
    body: `Many research projects begin with a request for a survey. Someone needs data on customers, beneficiaries or a policy issue, and a questionnaire looks like the obvious first step. Weeks later a report arrives, full of percentages, and nobody is quite sure what to do with it.

We work the other way round. We start with the decision you need to make, not the survey you think you need. A research question built around a real decision tells you what to measure, whom to ask, how precise the answer must be and when you need it. Sometimes it also tells you that new research is not needed at all.

## Five questions to answer first

Before anyone drafts a questionnaire, work through these five questions with the people who will use the results.

### 1. What decision will this inform?

Write the decision as a choice between real options. "Should we expand the programme to two more districts, or deepen it where we already work?" is a decision. "Understand our impact" is not. If you cannot name the options, you are not ready to commission data collection.

### 2. Who will act on the answer?

A board, a funder, a ministry and an examiner each need different things. Think about what your audience already believes, what they will find convincing and how they like to receive evidence. A finance committee may want costs and returns. A programme team may want to know which activities to change.

### 3. What would change your mind?

This question sharpens everything else. Before collecting any data, describe the result that would make you choose one option over another. If demand among current customers falls below a certain level, you will not launch. If outcomes for programme households are no better than for similar households elsewhere, you will rethink the model.

If no plausible result would change the decision, think hard about whether research is the best use of the budget.

### 4. What evidence would be enough?

Decide how strong the evidence needs to be. A quick decision with little at stake may need only a few focus groups or a look at existing data. A national policy recommendation may need a representative survey with tight margins of error. Agree in advance:

- which groups you need results for, such as urban and rural, or women and men
- how precise the main estimates must be
- whether you need numbers, explanations or both, which is where mixed-methods designs earn their keep
- what existing sources, such as administrative records or earlier surveys, can already tell you

### 5. When is the decision being made?

Work backwards from the date of the decision. Evidence that arrives after the board meeting, the budget round or the submission deadline is of little use to anyone. The timeline shapes the method too: a decision due in six weeks rules out some designs and favours others.

## From vague to useful: three examples

Here is how the framework changes a research question in practice. The examples are illustrative, but the pattern holds for most projects.

### A business

**Before:** What do customers think of our brand?

**After:** Should we launch our new family-size pack in Copperbelt supermarkets before the festive season, and at what price? We will go ahead if at least a quarter of current buyers in our main customer group say they would choose it at our target price.

The first version could produce a long report on brand perceptions and still leave the launch decision open. The second tells the research team which customers to sample, which prices to test and what result would trigger a launch.

### An NGO

**Before:** What is the impact of our savings group programme?

**After:** Has our savings group programme increased the share of member households that can cover an unexpected expense without selling assets, compared with similar households the programme has not yet reached? Is the change large enough to justify expanding to two more districts next year?

The revised question names the outcome, the comparison and the decision. It also tells you that you need a baseline, a comparison group and results in time for next year's planning. If you are setting up an evaluation like this, our [monitoring and evaluation](/services/monitoring-evaluation) team can help with the design.

### A student

**Before:** Factors affecting small businesses in Zambia.

**After:** Among market traders in Lusaka, is regular use of mobile money associated with keeping written business records, after accounting for education and business size?

If you are a student, the decision is what your dissertation can credibly argue with the time, budget and access you have. The first topic is too broad to answer well in a year. The second defines the population, the relationship to test and the factors to control for, and a student could realistically answer it with a well-designed survey. If you are working on a thesis or dissertation, our [academic research support](/services/academic-research-support) can help you sharpen the question and plan the method.

## A simple test for any research question

Before you sign off a research question, check that it names:

- **The population:** who exactly you will study
- **The measure:** what you will count, compare or explore
- **The comparison:** a previous year, another group or a target
- **The decision:** what you will do differently depending on the answer

If any of these is missing, the study will probably produce interesting findings that nobody can use.

> **Key takeaway:** a research question is ready when you can say what you will do if the answer comes back one way, and what you will do if it comes back the other.

## When you may not need a survey at all

Working through the framework sometimes shows that the evidence already exists, in sales records, programme monitoring data or a recent national survey. Sometimes a handful of in-depth interviews will answer the question faster and more cheaply than a large sample. A good research partner should tell you that, even when it means a smaller project.

## Bring us the decision

You do not need a finished research question to talk to us. Bring the decision you are facing, the people who will act on the answer and your deadline, and we will help you shape the rest. [Start a project](/start-a-project) or [contact us](/contact).`,
  },
  {
    slug: "baseline-midline-endline-evaluation-design",
    title: "Baseline, midline, endline: getting evaluation design right from day one",
    excerpt:
      "Many evaluation problems start long before the endline. How to build a theory of change, choose indicators you can measure again and set up a fair comparison from day one.",
    category: "Evaluation",
    author: "Primeresearch Consultants",
    publishedAt: "2026-09-22",
    featured: false,
    body: `When an evaluation struggles to show what a programme achieved, the cause often goes back to the first month. The baseline was collected after activities had started. The indicators were defined differently at endline. There was no group to compare against. By the time the final evaluation came round, the evidence it needed did not exist.

Getting the design right from day one costs far less than rebuilding evidence later.

## Begin with a theory of change

A theory of change sets out, step by step, how your programme is expected to work:

- **Inputs:** the money, people and materials you put in
- **Activities:** what you do, such as training, grants or outreach
- **Outputs:** the direct products, such as people trained or loans issued
- **Outcomes:** the changes you expect in knowledge, behaviour or circumstances
- **Impact:** the longer-term change the programme aims to contribute to

The most useful part is often the assumptions linking each step. Training farmers leads to better yields only if they can afford inputs, the rains arrive and the advice suits local conditions. Writing these assumptions down shows you what to measure and where the programme might break.

## Choose indicators you can measure again

Every outcome in the theory of change needs at least one indicator. Good indicators are SMART:

- **Specific:** clear about what is measured and for whom
- **Measurable:** something you can count or rate consistently
- **Achievable:** realistic for the programme's scope and time
- **Relevant:** linked directly to an outcome you care about
- **Time-bound:** tied to a date or period

For evaluation there is one more test: can you measure it the same way at baseline, midline and endline? That means fixed question wording, the same definitions and recall periods and, ideally, data collection at the same time of year. In farming communities, a survey in the lean season and another just after harvest can show a change in food security that has nothing to do with your programme.

Record each indicator in a reference sheet with its definition, data source, calculation, frequency and the person responsible. It feels like paperwork. It is also what lets someone else repeat the measurement three years later.

## Plan the three rounds

| Round | When | What it is for |
|---|---|---|
| Baseline | Before activities start | Records starting values in the programme and comparison groups |
| Midline | Partway through | Checks progress and implementation while there is time to adjust |
| Endline | At or after the end | Measures change against the baseline and the comparison group |

The baseline must come before the programme reaches people. Once training has started or transfers have been paid, you are measuring a mix of the starting point and early effects, and the true change will look smaller than it is.

Not every programme needs a midline. It earns its place when there is still time and budget to act on what it finds, which rules out a midline that reports in the final year.

For the endline, use the same tools, sampling approach and season as the baseline. If you plan to follow the same households, collect tracking details at baseline, such as phone numbers, landmarks and GPS points, with consent, so you can find people again.

## Attribution or contribution?

Two different questions are easy to blur:

- **Attribution** asks how much of the observed change the programme caused. Answering it needs a credible estimate of what would have happened without the programme, which usually means a comparison group.
- **Contribution** asks whether the programme plausibly played a part in the change, alongside other factors. It relies on testing each link in the theory of change with evidence and ruling out other explanations.

Both are legitimate. Trouble starts when a programme designed only to show contribution is expected to prove attribution at the end. Decide early which question your funders and managers need answered, and design for it.

## Finding a fair comparison

A comparison group shows what would probably have happened without the programme. Options include:

1. **Random assignment:** eligible communities or households are allocated to the programme by lottery. This gives the strongest evidence, where it is ethical and practical.
2. **Phased roll-out:** if the programme cannot reach everyone at once, areas scheduled for later can serve as the comparison until their turn comes.
3. **Matched comparison:** similar communities are selected on baseline characteristics, and change in both groups is compared over time, often with a difference-in-differences analysis.

Without any comparison, a before-and-after change might reflect a good harvest, a price shift or a new government scheme rather than your work.

## Common pitfalls

- **The baseline arrives too late,** after activities have begun.
- **Indicators cannot be measured again,** because the wording changes, the data source disappears or the definition was never written down.
- **There is no comparison group,** so the programme's effect cannot be separated from everything else going on.
- **The sample is too small** to detect the size of change the programme can realistically achieve.
- **Nobody plans for attrition,** so households that move or drop out leave gaps in the data.

## The OECD DAC criteria

Many funders frame evaluations around the OECD DAC criteria, which also make a useful checklist for your evaluation questions:

| Criterion | The question it asks |
|---|---|
| Relevance | Is the programme doing the right things for the people it serves? |
| Coherence | How well does it fit with other work in the same place or sector? |
| Effectiveness | Is it achieving its objectives? |
| Efficiency | Is it using resources well and delivering on time? |
| Impact | What difference does it make, intended or not? |
| Sustainability | Will the benefits last after funding ends? |

Answering all six at endline is much easier if the baseline collected what you will need.

> **Key takeaway:** the endline can only be as good as the baseline. Settle the theory of change, the indicators and the comparison group before the first activity starts.

## Planning an evaluation?

If you are designing a programme or have just secured funding, now is the right time to plan the evaluation. Our [monitoring and evaluation](/services/monitoring-evaluation) team can help you build the theory of change, set indicators and design a baseline that will still be useful at endline. [Contact us](/contact) to talk it through.`,
  },
  {
    slug: "five-checks-for-reliable-survey-data",
    title: "Five checks that separate reliable survey data from noise",
    excerpt:
      "Reliable survey data is made in the field. Five quality checks to run while interviews are still under way, and why catching problems early beats fixing them later.",
    category: "Fieldwork",
    author: "Primeresearch Consultants",
    publishedAt: "2026-09-26",
    featured: false,
    body: `Every survey dataset looks tidy in a spreadsheet. Whether it reflects what respondents actually said is another matter. Interviewers get tired, misread questions or, occasionally, make answers up. Tablets record the wrong location. Questionnaire logic sends people down the wrong path. None of this shows up unless you look for it.

The most reliable surveys build quality checks into fieldwork itself. Here are five we consider essential, and why running them while interviews are under way beats cleaning afterwards.

## 1. Back-checks

A back-check is a short repeat interview with a random selection of respondents, carried out by a different team member within a few days of the first visit. It asks a small set of questions again and compares the answers. Choose questions of three kinds:

- **Facts that should not change,** such as household size, the age of the household head or the roofing material. Differences here point to a careless or invented interview.
- **Questions about the interview itself,** such as whether it took place, roughly how long it lasted and whether consent was explained.
- **A few questions that are harder to ask well,** to see whether the original interviewer asked them properly.

As a starting point, back-check around one in ten interviews, spread across every interviewer, with extra checks for anyone whose data looks unusual. Interviewers should know that back-checks happen, but not which interviews will be chosen.

## 2. GPS and timestamp checks

Tablets can record where and when each interview took place. That makes several quick checks possible:

- Are interviews located inside the assigned enumeration area or village?
- Are several interviews recorded at almost the same spot when they should be at different homes?
- Do start and end times make sense, or does one interviewer have overlapping interviews?
- Were interviews completed at unlikely hours, such as late at night?
- Is a questionnaire that normally takes 45 minutes being finished in 15?

Location data is personal information. Explain its use during consent, store it securely and remove or mask it before any dataset is shared.

## 3. Audio audits, with consent

With the respondent's permission, the tablet can record short, random sections of the interview. A supervisor then listens to a sample to confirm that the interview happened, that questions were read as written and that the interviewer probed without leading.

Audio audits show why data looks odd, as well as whether it does. Anonymised clips also make good training material. They need careful handling:

- Ask for consent clearly, and respect a refusal without any penalty to the respondent.
- Include audio recording in your ethics approval and data protection plan.
- Limit who can listen, store recordings securely and delete them on schedule.

## 4. Real-time consistency and range checks

The cheapest error to fix is the one that never gets recorded. A well-programmed CAPI questionnaire checks answers as they are entered:

- **Range checks** block impossible values, such as an age of 150 or a negative household size.
- **Consistency checks** compare answers with each other. A respondent recorded as 16 years old with 30 years of work experience should trigger a query.
- **Soft checks** flag values that are unusual but possible and ask the interviewer to confirm before moving on.
- **Skip logic** routes each respondent to the right questions, so nobody is asked about children they do not have.

Test all of this thoroughly before fieldwork. A logic error found on the first day can be fixed in an hour. Found after fieldwork, it can mean whole sections of missing data.

## 5. Interviewer-level monitoring

Data problems often cluster around a few interviewers. Looking at results by interviewer, every day, is the fastest way to find them. Useful indicators include:

- **Interview duration:** consistently short interviews are a warning sign.
- **Skip patterns:** an interviewer who records "no" to filter questions far more often than colleagues may be avoiding long follow-up sections.
- **Don't know and refusal rates:** unusually high or low rates both deserve a look.
- **Outliers and odd patterns:** too many round numbers, identical answers or values far from the rest of the team.
- **Productivity:** far more interviews per day than colleagues in similar areas.

A simple daily dashboard, reviewed by field supervisors each morning, turns these into a short list of follow-ups. Many issues have an innocent explanation, such as a misunderstood question, and feedback or retraining fixes them. Persistent problems may mean re-interviewing households or replacing an interviewer.

| Check | What it catches | When to run it |
|---|---|---|
| Back-checks | Invented or careless interviews | Within days of the first visit |
| GPS and timestamps | Interviews in the wrong place or at implausible times | Daily, as data comes in |
| Audio audits | Poor question reading, leading, skipped consent | Throughout, with more in the first week |
| Consistency and range checks | Impossible or contradictory answers | During the interview |
| Interviewer monitoring | Shortcuts, fatigue and misunderstanding | Daily |

## Why checking during fieldwork beats cleaning afterwards

Data cleaning still matters. But cleaning after fieldwork can only work with what was collected. Once the team has left an area, you cannot ask a missed question, confirm a suspicious answer or replace an invented interview without an expensive return trip. Often the only option is to drop the problem cases, which shrinks your sample and can bias results if those cases come from particular areas or groups.

Checking during fieldwork changes that. You can send an interviewer back while the team is still nearby, fix a questionnaire bug before it affects every remaining interview and retrain someone on day two rather than discovering the problem in week six. Interviewers who know their work is checked, and who get quick, fair feedback, tend to do better work too.

> **Key takeaway:** quality is built in the field. Agree your checks before fieldwork starts, run them every day and act on what they show while you can still go back.

If your own team runs fieldwork, our [research training](/training) can help your interviewers and supervisors develop these habits. Our [data collection and field services](/services/data-collection-field-services) team can also build the checks into your survey from the start.

## Planning fieldwork?

If you are about to collect data, or have doubts about data you already hold, we are happy to talk through a quality plan that fits your survey. [Get in touch](/contact).`,
  },
  {
    slug: "what-a-good-research-report-should-do",
    title: "From dataset to decision: what a good research report should do",
    excerpt:
      "A report earns its keep when someone can act on it. How to lead with the answer, write a summary that stands alone, be honest about limits and design charts that make one point.",
    category: "Reporting",
    author: "Primeresearch Consultants",
    publishedAt: "2026-09-29",
    featured: false,
    body: `A dataset is not a decision. Between the two sits the report, and that is where many good studies lose their value. The main finding is buried on page 40. Charts try to show everything at once. Recommendations float free of the evidence. The reader, short of time, gives up.

A good research report makes the answer easy to find and shows the reader why they can trust it. Here is how.

## Lead with the answer

Most readers want to know what you found before they want to know how you found it. Start the report, and each section, with the main finding. Then give the evidence behind it, then the detail.

Compare two openings:

- "This section presents findings on household water use, disaggregated by district and income group."
- "Households in District A spend about twice as long collecting water as those in District B, and the gap is widest for the poorest households."

The second tells the reader something on the first line. The first makes them hunt for it.

## One idea per section

Give each section a single job, and title it with its point rather than its topic. "Water use" is a label. "Most households rely on a single water source" is a finding. If you cannot sum up a section in one sentence, it is probably doing two jobs and should be split.

## Write an executive summary that stands alone

Assume some readers will read only the executive summary. For many decision-makers, it is the report. It should make sense without the rest of the document and, in a page or two, cover:

1. the question and why it matters
2. how the evidence was gathered, in a sentence or two
3. the main findings, with the key numbers
4. what the findings mean for the decision
5. the main limitations
6. the recommendations

Write it last, once you know what the report says. Then test it on someone who has not seen the full document. If they cannot explain the main finding back to you, rewrite it.

## Be honest about limitations

Every study has limits: people the sample could not reach, response rates, wide margins of error for small subgroups, reliance on self-reported behaviour, the timing of fieldwork. Stating them plainly tells readers how far they can push the findings. It also shows that the rest of the report can be trusted.

Say what each limitation means in practice. "The sample excludes households without a phone, so results may understate hardship" is far more useful than a general line about the limitations of the methodology.

## Charts that make one point each

A chart should answer one question, and its title should state the answer. "Waiting time is the most common complaint" works better than "Complaints by category".

Habits that help:

- **Highlight the bar that matters.** Show it in a strong colour and keep the rest grey, so the eye goes straight to the point.
- **Sort bars by size,** unless the categories have a natural order, such as age groups.
- **Label values directly** rather than relying on gridlines and legends.
- **Start bar charts at zero,** so differences are not exaggerated.
- **Show the base.** Give the question wording and the number of respondents (n) under each chart.
- **Drop the decoration.** 3D effects, shadows and pie charts with many slices make comparisons harder.

## Tie recommendations to evidence

A recommendation should follow from a finding the reader has already seen. For each one, make clear which evidence it rests on, who should act and by when. Keep them few and specific. A long list of vague recommendations is easier to ignore than a short list of precise ones.

Keep what the data shows separate from what you suggest doing about it. Readers may accept your findings and still weigh the options differently. That is their call to make, and a clear report helps them make it.

## Put the methods in an appendix

Methods matter, and a credible report explains them in full. Most readers, though, need only a short paragraph in the main text: who was surveyed, how, when and with what sample size. The full detail belongs in appendices:

- sampling design and selection
- the questionnaire and any translations
- weighting and how estimates were calculated
- response rates and fieldwork dates
- data cleaning rules and quality checks
- full data tables

This keeps the main report short without hiding anything, and lets a technical reviewer check your work.

## Quick fixes for common problems

| Instead of | Try |
|---|---|
| A long background chapter before any findings | A short context paragraph, with the findings first |
| A chart titled "Responses by district" | A title that states what the chart shows |
| Every number to two decimal places | Rounded figures, such as "about four in ten" |
| "Further research is needed" | The specific gap, and what would fill it |
| A list of recommendations at the end | Each recommendation linked to its finding |

> **Key takeaway:** write for the reader who has ten minutes and a decision to make. If the answer is clear on the first page and every claim can be traced to the evidence, the report has done its job.

## Need help turning data into a report?

If you have data and need a report that people will read and act on, our [data analysis and reporting](/services/data-analysis-reporting) team can help, from the analysis plan to the final presentation. [Start a project](/start-a-project) and tell us what decision the report needs to support.`,
  },
];
