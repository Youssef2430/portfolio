# When markets misbehave.

Every risk model eventually writes down a sentence like *these two things are independent*. It takes four words. It deletes whole rows from a covariance matrix. And it rarely gets checked as carefully as the algebra that follows it.

I built this model for a stochastic processes course to see exactly what that sentence buys, and what it costs. It has three moving parts: a market return, a sector’s volatility that reacts to the market, and an outside shock that I *declare* independent of both. Every chart in this note runs in your browser from a seeded simulation, so you can break the assumptions yourself.

Start with the simplest market there is: one price and one source of noise.

:::experiment markets:::

## One price, one source of noise

The paths above follow **geometric Brownian motion**, or GBM, the same model that sits underneath Black–Scholes. Think of it as compound growth with a steady hiss of random noise, where the noise scales with the price. A \$100 stock and a \$10 stock get the same *percentage* wobble.

$$dS_t = \mu S_t\,dt + \sigma S_t\,dW_t$$

There are two knobs. The drift $\mu$ sets the expected growth rate. The volatility $\sigma$ sets the size of the hiss. $W_t$ is Brownian motion,[^brown] the mathematician’s version of a random walk: over any interval of length $\Delta t$, its step is normally distributed with variance $\Delta t$ and independent of every step before it.

Drag volatility to zero and every path collapses onto the same smooth curve. Now turn it up, and notice what *doesn’t* happen: the paths don’t all grow faster. The spread of possible futures widens instead. Volatility isn’t a direction. It’s fog.

The equation has an exact solution:

$$S_t = S_0\exp\left[\left(\mu-\frac{\sigma^2}{2}\right)t+\sigma W_t\right]$$

That $-\sigma^2/2$ is the least intuitive term in this article. The short version: when a price wobbles symmetrically in percentage terms, losses hurt more than gains help,[^drag] so the typical path drifts below the average one. The logarithm of the price feels that drag directly, which is why the drift of **log-price** differs from the expected growth rate of price. The derivation is below if you want it.

### 1.2 Solving the SDE via Itô’s Lemma

Apply Itô’s lemma to $f(S)=\log S$, with $f'(S)=1/S$ and $f''(S)=-1/S^2$:

$$d\log S_t = \frac{1}{S_t}dS_t-\frac{1}{2S_t^2}(dS_t)^2$$

Using $(dW_t)^2=dt$ gives:

$$d\log S_t=\left(\mu-\frac{\sigma^2}{2}\right)dt+\sigma\,dW_t$$

Integrate from zero to $t$, then exponentiate to recover the solution above. Over any interval $\Delta t$, the log-return is therefore normal:

$$\log\frac{S_{t+\Delta t}}{S_t}\sim\mathcal N\left(\left(\mu-\frac{\sigma^2}{2}\right)\Delta t,\;\sigma^2\Delta t\right)$$

Daily steps use $\Delta t=1/252$, so the daily standard deviation is $\sigma/\sqrt{252}$.

### What GBM gets right, and wrong on purpose

GBM gets two things right. Prices stay positive, and the model can be simulated exactly, with no discretisation error. It also gets at least one thing wrong on purpose: volatility is constant. Real markets have calm stretches and storms, and the storms cluster. Keep an eye on the rolling volatility view below. In GBM it hovers around one level by construction. When we meet real data later, it very much doesn’t.

:::experiment foundations:::

The defaults are an annual drift of $\mu=0.12$ and volatility of $\sigma=0.214$. Resampling draws fresh noise. Moving the volatility slider keeps the same noise, so the only thing you’re seeing change is $\sigma$.

## Three sources of trouble

A single $\sigma$ lumps every kind of risk together. I wanted to pull them apart into three variables, each with its own story, so I could say precisely how they relate.

**The market return, $R_M$.** Daily market log-returns follow a normal distribution. I calibrated it on S&P 500 data from 2020 to 2024: a daily mean of $0.000474$ and a daily standard deviation of $0.013504$, or about $21.4\%$ a year.[^annual]

$$R_M\sim\mathcal N(\mu_M,\sigma_M^2)$$

**Sector volatility, $V_S$.** This one reacts to the *size* of the market’s move. Given $R_M$, its logarithm is normal:

$$\log V_S\mid R_M\sim\mathcal N(\alpha+\beta|R_M|,\tau^2)$$

I use $\alpha=-3.5$, $\beta=15$ and $\tau=0.3$. These are illustrative parameters I chose, not estimates fitted to sector data. The absolute value is the interesting part: a 2% rally and a 2% crash rattle the sector by exactly the same amount.

:::experiment conditional:::

Drag the market return in either direction and watch the sector’s distribution slide to the right. That symmetry is a convenient simplification and a real limitation. It’s a same-day magnitude effect. It doesn’t produce volatility that lingers for weeks, and it ignores the well-documented habit of crashes rattling markets more than rallies do.[^leverage]

**The outside shock, $Z$.** Some disturbances don’t diffuse. They arrive as jumps. I model them as a compound Poisson variable over one trading day:

$$Z=\sum_{i=1}^{N}J_i,\qquad N\sim\operatorname{Poisson}(0.05),\qquad J_i\sim\mathcal N(0,0.02^2)$$

A rate of $0.05$ means one jump every twenty trading days on average. The chance of at least one on a given day is $1-e^{-0.05}\approx4.88\%$, slightly under 5%, because a few days get more than one. Jump sizes are independent of each other and of how many jumps occur.

And here is the sentence this whole project is about: I also assume the shock is independent of the market and the sector together.

(The ↯ button in the first chart is something else, by the way: a fixed 20% drop on day 126 applied to every path. It’s a stress test for comparing the same futures with and without a sudden fall, not a draw from this model.)

## What independence buys, and what it costs

Calling a shock “external” doesn’t make it statistically independent. A pandemic moves the market *and* every sector at once. I impose independence anyway, to see exactly what it buys:

$$Z\perp\!\!\!\perp(R_M,V_S)$$

The joint law then splits into a market–sector part and a shock part. Notice what *doesn’t* split: the market and the sector stay tangled, because the sector’s distribution depends on the market’s return.

There’s a small technical trap here. On most days no jump happens, so $Z$ has a point mass at zero,[^atom] and a single ordinary density can’t describe it. The factorisation is safest written in terms of probability laws:

$$P_{R_M,V_S,Z}=P_{R_M,V_S}\otimes P_Z$$

Independence also zeroes out every covariance involving $Z$:

$$\Sigma=\begin{pmatrix}\sigma_M^2&\operatorname{Cov}(R_M,V_S)&0\\\operatorname{Cov}(R_M,V_S)&\operatorname{Var}(V_S)&0\\0&0&\operatorname{Var}(Z)\end{pmatrix}$$

Now the part that catches people out. The reverse doesn’t hold: zero covariance does not mean independence, and this model contains a perfect example. If market returns were symmetric around zero, $R_M$ and any function of $|R_M|$ would have zero covariance. Yet $V_S$ is literally computed from $|R_M|$. You dragged that U-shape a minute ago.

> A correlation near zero means no straight-line relationship. It does not mean nothing to do with each other.

The diagnostics below check that my simulator agrees with its own assumptions. That’s a necessary test and a weak one. A simulator can implement a wrong model flawlessly, and these checks can’t tell the difference.

:::experiment diagnostics:::

## Meeting real data

The calibration window is a greatest-hits compilation: the COVID crash, the recovery, the 2022 bear market and the 2023–24 rally. That variety is useful, but a single fitted volatility squeezes four very different regimes into one number.

:::experiment history:::

Look at rolling volatility in that explorer: lumpy, clustered, nothing like the flat line GBM promises. It’s the best one-chart argument against constant volatility I know.

Two caveats about units. The project’s parameters came from *daily* observations, while this explorer uses a separately sourced *monthly* series, so their returns and volatilities won’t match exactly. Sector and shock parameters remain illustrative choices. And a daily log-return mean is not the GBM price drift divided by 252: the $-\sigma^2/2$ correction sits between them. The opening chart keeps $\mu=12\%$ as an illustrative price drift rather than claiming it reproduces the fitted daily mean.

## Turning three risks into one number

To combine the three variables into a single loss, the project defines:

$$L=-w_1R_M-w_2\log V_S+w_3|Z|,\qquad(w_1,w_2,w_3)=(1,0.5,0.3)$$

This is a stylised score in **model loss units**, not dollars and not a percentage return. A rising market lowers it. A shock in either direction raises it, through $|Z|$. With this sign convention a higher $\log V_S$ *lowers* the score, which is a particular exposure I chose, not a claim that volatility is good for anyone.

Two numbers summarise the tail. **Value at Risk** answers “how bad is a bad day?”: the loss threshold that a given share of outcomes stays below. **Expected shortfall** asks the follow-up question VaR can’t: “and when it’s worse than that, how bad on average?”[^es]

$$\operatorname{VaR}_q=F_L^{-1}(q),\qquad\operatorname{ES}_q=\mathbb E[L\mid L\geq\operatorname{VaR}_q]$$

:::experiment risk:::

Both estimates come from the scenarios the explorer just generated, so they move as you change the seed or the sample size. That wobble is honest. A risk number computed from a finite sample has its own uncertainty, and it’s worth seeing it.

Independence pays off one last time in the variance. Every cross-term involving the shock vanishes:

$$\operatorname{Var}(L)=w_1^2\operatorname{Var}(R_M)+w_2^2\operatorname{Var}(\log V_S)+w_3^2\operatorname{Var}(|Z|)+2w_1w_2\operatorname{Cov}(R_M,\log V_S)$$

At the default weights, the sector term dominates. Turn its weight down in the explorer and watch the attribution shift.

## What I’d revisit

The independence assumption is the first thing I’d question. Real shocks move market returns and sector volatility together. Parameters drift. Volatility persists. A constant-volatility process with an independent jump component leaves every one of those mechanisms out.

Stochastic volatility would let uncertainty evolve over time. Regime switching would allow calm and turbulent market states. A richer joint model could relax the independence of the shock. I’d add them one at a time and compare each against this baseline, rather than piling on parameters at once.

What I valued most was following a single assumption all the way through: from one sentence, into the algebra, and out into the simulation. Independence deletes terms from a covariance matrix with a stroke of the pen. Whether those terms deserved to go is a question the pen can’t answer. That still takes data.

## Reading further

The theoretical background includes Black and Scholes (1973), *The Pricing of Options and Corporate Liabilities*; Merton (1976), *Option Pricing When Underlying Stock Returns Are Discontinuous*; Heston (1993), *A Closed-Form Solution for Options with Stochastic Volatility*; and Cont (2001), *Empirical Properties of Asset Returns: Stylized Facts and Statistical Issues*.

*Prepared for CSI 5138: Stochastic Processes. Interactive charts use seeded browser simulations. The historical chart uses monthly Shiller/FRED data distributed by the datasets project.*

[^brown]: Named after the botanist Robert Brown, who in 1827 watched particles from pollen grains jitter in water. Louis Bachelier used the same idea to model Paris bond prices in 1900, five years before Einstein explained the jitter.
[^drag]: Fall 50%, then rise 50%, and \$100 becomes \$75. The two moves are the same size in percentage terms, but they don’t cancel.
[^annual]: Annualising multiplies the daily standard deviation by $\sqrt{252}$, the number of trading days in a year: $0.013504\times\sqrt{252}\approx0.214$.
[^leverage]: Usually called the leverage effect: volatility tends to rise more after a fall than after a gain of the same size.
[^atom]: Measure theorists call a point mass like this an *atom*. A density can describe a smooth spread of probability, but not a lump sitting on a single value.
[^es]: That gap is why the Basel market-risk rules moved from 99% VaR to 97.5% expected shortfall: VaR says where the tail starts, but nothing about how deep it goes.
