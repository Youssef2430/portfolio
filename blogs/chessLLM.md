# Can a language model play chess?

This is the entire job description I gave seven language models:

> Choose the best chess move. Reply with exactly one legal UCI move, such as e2e4 or a7a8q, and no other text.

On White’s tenth move of game three, Claude Opus 5.5 replied:

```text
Your request asks for a move only, so I'll comply.

Wait, must be exact. Let me pick a solid move: c1g5 pinning the knight?
Black queen on c8 protects... Bg5 is fine. Or h2h3. Bb5+ c6. I'll go c1g5.

c1g5
```

`c1g5` was legal and perfectly reasonable, and it lost Opus the game, because my benchmark didn’t accept a move with a paragraph attached. Opus lost nine of its ten games that way. Stockfish never checkmated it once.[^elo]

That was version two of **chessLLM**, my harness for making language models play complete games against a chess engine. This is the story of version three: what it took to stop losing games to sentences without starting to guess, and what I found once I had.

Here’s the whole story in two pictures. First, the twelve games v2 forfeited, judged again by v3.

:::experiment flip:::

Every one of those replies ended with a legal move on its own line. v3 reads that line, and nothing else, and plays the move each model actually meant. Twelve forfeits become zero.

Now the catch. Here’s what the extra thinking in v3 bought each model at the board, and what it cost them on the clock.

:::experiment price:::

Every arrow points right: everyone got slower. Only one points clearly down. Fixing the format didn’t fix the chess. The rest of this article is how I got from the first picture to the second, including the night my own code forfeited twelve games, a model tried to open a terminal, and one game ran for three hours without ending.

First, try the job yourself. The terminal below shows the exact prompt from a position where a model forfeited. Play it under v2’s rules, then flip the switch and play it under v3’s.

:::experiment model:::

## An arbiter you can’t charm

Most language model evaluations have a judging problem. Ask a model to summarise a paper and someone, often another model, has to decide whether the summary is any good. Now you’re measuring two models and a rubric.

Chess skips all of that. The rules decide in microseconds whether a move is legal, and an engine can say roughly how good it was. That’s the entire appeal, and it comes with a responsibility to keep three questions apart:

1. **Did the model follow the format?** Could the harness read a move out of the reply?
2. **Was the move legal?** A readable move can still be impossible in the position.
3. **Was it any good?** A legal move can hang the queen.

Every version of this project has been an attempt to stop those three from bleeding into each other.

## Version one was lying to me

The first version, from the summer of 2025, had a lovely terminal dashboard and a very generous heart. Here is what it did when it couldn’t parse a reply:

```python
except Exception as e:
    logger.warning(f"LLM move failed: {e}, falling back to random")
    # Fallback to random legal move
    legal_moves = list(board.legal_moves)
    ...
    fallback_move = legal_moves[0]  # Simple fallback
    return fallback_move
```

The log says random. The comment says random. The code plays whichever legal move happens to be listed first, and the game carries on as if the model had chosen it.[^first] Games that hit the move limit were recorded as draws, models with unknown prices were free, and the database held zero records of individual games.[^audit] Every bug flattered the models.

## Version two: strict, and wrong in a new way

So version two was petty on purpose. The prompt carried the position as FEN,[^fen] the full history and the complete list of legal moves.[^uci] The whole reply, trimmed, had to be one legal move, or the game was forfeit. No retries, no repairs, no conversions.

Across 797 decisions, not one model picked a move outside the list. Every forfeit came from the format rule, and there were twelve: nine from Opus, three from Sonnet. **All twelve ended with a legal move**, usually a sensible one. The models weren’t confused about chess. They just couldn’t stop annotating.

That’s where a parser stops being plumbing and starts being a judgement call. Here are all twelve real replies, under four judges.

:::experiment parsers:::

Version one’s parser accepts all twelve, and in game ten it plays `e3f2`, a move Opus floated and then rejected. The last-word rule gets all twelve right but only by luck, since “e7e6, though d7d5 is fine” would play `d7d5`. Version two refuses all twelve, which is honest but measures sentence discipline as if it were chess.

The fourth judge is where I ended up, and building it properly turned into four separate problems.

## Challenge one: agree on a format before arguing about chess

The cleanest fix for chatty replies is to make chattiness impossible. Codex and Claude Code both accept a JSON schema for their final answer, so v3 hands them one where the only allowed values for `move` are the legal moves in the current position:

```json
{ "type": "object",
  "properties": { "move": { "type": "string", "enum": ["d3d4", "d3e2", "d3d2", "d3c2"] } },
  "required": ["move"], "additionalProperties": false }
```

The models can still think out loud as much as they like. They just have to hand the move over in a box. Over the v3 run, Codex and Claude sent 365 structured replies, and every one parsed first time as a legal move.

Google’s Antigravity client doesn’t offer structured output, so its two Gemini models needed a parser. The rule I settled on is that a move is only read from an **unambiguous place**: the entire reply, a JSON object, a single move alone in a final code block, a final line marked “Final move:”, or a final line holding exactly one move. Anything else is rejected. The parser never chooses between moves it found in prose.[^ladder] Fifteen Gemini replies arrived as analysis essays ending in a move on its own line, and all fifteen were read correctly.

Then I ran it, and my own harness forfeited twelve games in under two minutes.

:::experiment falsestart:::

Claude had done everything right. The schema-checked move arrived in a structured field my code wasn’t reading, so every reply looked empty. Each decision burned its three attempts on the same empty string and the game was forfeit. It was exactly the failure the whole article is about, except this time the harness couldn’t parse the model rather than the other way round. Finding it meant reading the raw client trace, which is why every request in v3 keeps one.

## Challenge two: when a reply is wrong, say why

Strictness without feedback is a trap: one bad token ends the game. v3 allows up to three attempts per decision, and a rejected reply is sent back with the reason, verbatim:

```text
Your previous response was rejected (missing_or_ambiguous_move).
Previous response: Kc2
Choose from the listed legal moves. Return only the requested move format.
```

Not every failure is the model’s fault, so failures are sorted before anyone decides what they mean. An unreadable or illegal reply gets feedback. A timeout or a dropped connection gets a bounded backoff and another attempt, without the scolding. Quota exhaustion, an authentication failure or a model-name mismatch stops that model outright, because retrying those only burns time. Every attempt, rejected or not, stays in the ledger.

The retry rule earned its keep three times, all from Gemini 3.8 Flash, and all the same mistake.

:::experiment retry:::

The prompt lists every legal move as a pair, like `d3c2 = Kc2`, and Flash answered with the right-hand half. The feedback fixed it on the second attempt every time. Nothing was converted on the model’s behalf: it had to send the move again, properly. That line matters. A harness that silently turns `Kc2` into `d3c2` is back to making decisions for the contestant.

## Challenge three: keep the tools out

These models don’t arrive as bare text generators. They arrive inside coding agents with shells, file access and plugins, and the whole point of the benchmark is that the chess comes out of the model unaided. So every request runs in a fresh session in a throwaway directory, with tools disabled wherever the client allows it. Every permission request the client sends back is answered with no, and any observed tool call stops that model.

I assumed that last rule was paranoia. Then, sixteen thoughts into its ninth move, Gemini 3.1 Pro reached for a shell.

:::experiment tool:::

It wasn’t trying to cheat, exactly. It had already chosen its move and wanted a terminal to print it: `echo "e1g1"`. Earlier in the same decision it had also planned to “check how my calculations compare to Stockfish’s assessments”, which is precisely the kind of help the rule exists to catch. The harness denied the command. The model noticed (“I realize I almost made a mistake! … External tools are off-limits”), reconsidered for another forty thoughts and answered with a different, legal move.

I disqualified it anyway. The benchmark can’t know what an approved tool would have done next, and a result labelled “unaided” has to mean it. Gemini 3.1 Pro has no v3 score, and that’s the most honest number I could give it.

## Challenge four: survive the night

At high effort, a single decision can take minutes. GPT-6 Sol’s median was 101 seconds per move, and two of its requests hit the 360-second timeout outright. Two games per model sounds small until you watch the clock.

So v3 writes everything down as it happens. Every request, rejected or not, goes into an append-only ledger, and every move is journalled. The full position is checkpointed atomically, so a crash can’t leave half a file behind. On restart, the runner replays the journal, checks the FEN and move history against it, and reuses answers it already paid for. Attempt budgets survive restarts too, so a resumed run can’t quietly hand a model a fresh set of retries.

That mattered sooner than I expected. The run was stopped and resumed twice: once to cut the schedule from ten games per model to two, and once to let the three GPT models run concurrently instead of one at a time. Both changes are recorded in the run’s manifest as amendments, with a reason. Three requests that were in flight when the first restart hit were marked interrupted and asked again. The second restart waited for its in-flight request to finish before handing over. Nothing was lost.

:::experiment timeline:::

The longest lane belongs to GPT-6 Sol’s second game. It reached the 200-ply limit after three hours and eleven minutes, with Sol down about five and a half pawns but never checkmated. Version one would have called that a draw. Version three calls it incomplete, which is what it was.

## What the fixes bought

:::experiment flow:::

Twelve games lost to formatting in v2, none in v3. Every rescue in the v3 bars is either a schema-checked answer, a move read from an unambiguous final line, or a retry after the model was told what was wrong. The harness never picked a move itself.

## What the fixes didn’t buy

Fixing the pipe doesn’t make anyone a better chess player, which is what the second chart at the top of this page shows. v3 also changed the effort level, the prompt (it now carries a short checklist about checks, captures and threats, plus an ASCII board), the opening and the number of games. So a model whose chess improved could owe it to any of those.

Only one arrow in that chart points clearly the right way. **GPT-6 Astra**’s average loss per move halved, from 48 to 24 centipawns, with no blunders at all, and it won both of its games. Opus and Sonnet barely moved. Sol got worse while writing a median of 3,521 output tokens per move. Luna, the fastest model in v2 at four seconds a move, now takes nearly fifty seconds and is still the weakest player in the field.

And every arrow points right, because high effort is expensive in the only currency a subscription run can measure: time. Here is every single wait.

:::experiment latency:::

## The games

Every v3 game is here move by move, with Stockfish’s opinion of each model decision and a mark wherever a move needed a retry (↻) or was read from the end of an analysis (¶). Switch to v2 for the old games, including Opus’s queen-down monologue in game ten.

:::experiment replay:::

A few worth opening: Gemini 3.8 Flash’s first game, which ran 130 plies and holds most of the run’s incidents in one place. GPT-6 Astra’s two wins, the most accurate complete games in the run. And Sol’s second game, if you have a long time.

## The scoreboard, with the denominators showing

:::experiment results:::

Two games per model is one opening played from both sides. That’s an anecdote with a methods section, not a ranking. When the run finished, my own tooling helpfully projected Astra’s two wins out to a ten-game record of ten and zero. That’s exactly the kind of number this article exists to be suspicious of, so it isn’t printed anywhere else.

## What I’d change next

- **Run v3 properly.** Ten games per model across five opening pairs, as originally planned, with confidence intervals worth printing.
- **Change one thing at a time.** Effort, prompt and output contract all moved together here. A matched v3 run at low effort would show how much of Astra’s gain was the extra thinking.
- **Take the menu away.** A harder condition without the legal-move list would test whether a model can keep track of the board on its own.
- **Report compliance as a score of its own.** Recoveries and retries are data about a model, not noise to be cleaned away. They deserve a column.

Version two taught me that a strict judge measures obedience. Version three taught me that fixing that fairly takes a schema, a principled parser, honest feedback, a sandbox and a journal. It also taught me that the model you’re measuring is only one of the things that can fail. When everything else is working, the chess is what’s left, and on this evidence there’s still a lot of room in it.

[^elo]: Stockfish ran at UCI_Elo 1320, the weakest setting it offers on the machine that ran this. Beating it is not the same as having a rating of 1320, and neither run estimates one.
[^uci]: UCI notation names the start and end squares: `e2e4` moves whatever is on e2 to e4. A fifth letter picks a promotion, as in `a7a8q`. SAN is the human notation, like `Nf3` or `Kc2`.
[^fen]: FEN is a one-line description of a position: every piece, whose turn it is, castling rights and a couple of counters. `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1` is the starting position.
[^first]: A move generator lists moves in a fixed order, so “the first one” is effectively the same move every time the same position comes up: deterministic, and chosen by nobody.
[^audit]: 533 PGN files on disk, 60 benchmark rows, 159 per-model summary rows, and not a single row for an individual game. The results existed. The database just didn’t know about them.
[^ladder]: The browser terminal at the top of this page runs a line-for-line TypeScript port of the harness’s parser, checked against the Python original on twenty-one tricky replies. It agrees on all of them.
