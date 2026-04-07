Project Blood Test

+ Move to Supabase 
————
[Panels]
Compact view display even more compact - standard panels as well as user defined panels (research/condition)
————-
[Results tab]

+ Don’t display analysis with x - they’re planned

+ Fix the names of the laboratories

Validate correctness of tests conversion.


Results tab
Sort by lab
+ Sort by date
+ Filter only bad analysis

Auto conversion ng - mmol- need to think more

“Isolate biomarker history” - Click on one analysis and see only this biomarkers in all history

User should be able to collapse/expand panels in analysis.

——————-

[Plan Tab]

Select beginning of the cycle (November, eg)
Display list of analysis
Each analysis has a period to test:  once a year, twice (every 6 month), thrice a year (every 4 months), four times a year (every 3 month). On a special occasion (before winter after summer, etc).

We have already in description how often each analysis should be taken for health person. Make it formal in json as a number. And based on that display the default periods for each analysis. 
Then user should be able to correct it manually where appropriate. 

In the end user will see a plan for the year.
On the form of list or in the form of matrix.

Also he could select what to skip.

Need also to think how to take into consideration user’s context, eg 78 yo, fatty liver, high holsterol, creator therapy.

Basically for now I should able to add manually comment for each test. But then how to organize them based on the comment?
Hm, maybe it should be rather like a tag/label. Personal reason, personal motivation, research condition. Research reason. 

Crestor therapy. Efficacy
Crestor therapy. Safety

Also this will allow to bind different analysis together in a package:

High homocysteine: b6,b9,b12, homocysteine.
Purple analyses
Red analyses

So it should have thee subsection
Planing periods/rules
Planning specific analyses
View plan report for the next 12 months
Different types of reports:
all planned analyses grouped by panels
Grouped by reasons/motivations
By months: in April I do this, in November this, etc 

In the report the analysis card should contain:
panel it belongs to
Motivational reason - each in separate line
How often to do
When the next time of doing
Possibility to skip the next time a specific analysis


Maybe allow user to create plans based on certain conditions /researches. e.g.
Condition: hypotiriodism
Analysis included: xxx, xxx, xxx
Period of making: xxxx

Research: Crestor Therapy
Biomarkers: TC, HDL-C, LDL-C, TRIG, …
Regularity: every 3 months.

So there should be a Condition/ Research and associated biomarkers with it - similar to panels. Well, actually it is a panel in essence.

Every blood test analysis will have a tag of “research/ condition” (many) associated

There should be a screen where we can monitor the dynamic of “state/condition/research” - in history? Separate screen? In Analytics?

I think there should always be a reason why to do examination. Not just “for fun”.

In planning user creates a new condition/research - a super panel is essence. He can add panels into it. And specify periodicity  per panel (or per condition? As first stage)
Then by unfolding panels - enable / disable specific analysis.

For condition/research he adds
Display name
Details of condition/reserch - displays it separately eg as popup or expand/collapse region.

————

[Analytics tab]

+ Divided by panels or conditions: HPG axis, thyroid etc

Display relevant tests history
+ Plot them on chart

+ Explain indexes
+ Calculate indexes
+ Plot indexes on chart

Chet should be advanced - to show values that are outside allowed range.

For each point on chart display a normal range.
Or
When user selects only one biomarker - then display its ref values range

For mobile web 
portrait view - simplify the chart details.
add a button “landscape view” - displays in landscape, hides top and bottom panels 
