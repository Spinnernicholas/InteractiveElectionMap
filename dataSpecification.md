# Election Data Specification

This readme describes the election data specification.

*This is a target specification and has not been implemented

# Definitions

- Contest: Single election race
- Choice: Candidate or Yes/No option

# main body

```javascript
data = {
    "contests": {contestID:...} || []
}
```
# contest

objects in data.contests

```javascript
{
    "id": string || int,                //contestID or Array index
    "label": string,                    //Label/Title for this contest
    "choices": {choiceID:...} || [],
    "results": {precinctID:...}         //Results by precinct
}
```

# choice

objects in contest.choices

```javascript
{
    "id": string || int,
    "label": string,
    "party": string || undefined
}
```

# precinct results

objects in contest.results

```javascript
{
    total: int,
    votes: {choiceID:int} || int[],
    winner: string || int           //choiceID of winning choice
}
```

# JSON Example
```json
{
    "contests": {
        "101": {
            "id": "101",
            "label": "Martian President",
            "choices": [
                { "id": 0, "label": "Elon Musk"},
                { "id": 1, "label": "Jeff Bezos"}
            ],
            "results": {
                "HELLAS001" : {
                    "total": 425,
                    "votes": [298, 127],
                    "winner": 0
                },
                "UTOPIA001" : {
                    "total": 383,
                    "votes": [177, 206],
                    "winner": 1
                },
                "ARGYRE001" : {
                    "total": 341,
                    "votes": [238, 103],
                    "winner": 0
                }
            }
        }
    }
}
```
