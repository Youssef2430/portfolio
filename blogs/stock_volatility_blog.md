Financial markets are one of the cleaner places to see stochastic processes escape the textbook. Prices move every day, but the uncertainty behind those moves is not all coming from one source. Some risk is market-wide, some is sector-specific, and some arrives as an external shock that does not politely wait for the model.

In this post, I build a three-variable volatility model around that idea. The variables are aggregate market returns, conditional sector volatility, and independent exogenous shocks. The goal is not to pretend this captures every feature of real markets, but to show how a carefully specified dependence structure gives us useful mathematics: joint density factorization, covariance structure, Monte Carlo diagnostics, and risk measures anchored to S&P 500 data.

---

## Section 1: Mathematical Foundations - Geometric Brownian Motion

### 1.1 The GBM Stochastic Differential Equation

The starting point is geometric Brownian motion (GBM), the standard baseline model for asset price dynamics. For an asset price $S_t$, GBM is specified by the stochastic differential equation:

$$dS_t = \mu S_t \, dt + \sigma S_t \, dW_t$$

where:
- $\mu$ is the drift coefficient (expected return rate)
- $\sigma$ is the volatility parameter (diffusion coefficient)
- $W_t$ is a standard Wiener process satisfying $W_t \sim \mathcal{N}(0, t)$ with independent increments

The Wiener process $W_t$ has the fundamental properties:
- $W_0 = 0$ almost surely
- $W_t - W_s \sim \mathcal{N}(0, t-s)$ for $t > s$
- Increments $W_{t_4} - W_{t_3}$ and $W_{t_2} - W_{t_1}$ are independent for $t_1 < t_2 \leq t_3 < t_4$

### 1.2 Solving the SDE via Itô's Lemma

To solve this SDE, we apply Itô's lemma to $f(S_t) = \ln(S_t)$. For a twice-differentiable function $f$, Itô's lemma states:

$$df(S_t) = f'(S_t)dS_t + \frac{1}{2}f''(S_t)(dS_t)^2$$

With $f(S) = \ln(S)$, we have $f'(S) = 1/S$ and $f''(S) = -1/S^2$. Substituting:

$$d\ln(S_t) = \frac{1}{S_t}\left(\mu S_t \, dt + \sigma S_t \, dW_t\right) - \frac{1}{2} \cdot \frac{1}{S_t^2} \cdot \sigma^2 S_t^2 \, dt$$

$$d\ln(S_t) = \left(\mu - \frac{\sigma^2}{2}\right) dt + \sigma \, dW_t$$

Integrating from $0$ to $t$:

$$\ln(S_t) - \ln(S_0) = \left(\mu - \frac{\sigma^2}{2}\right)t + \sigma W_t$$

This yields the closed-form solution:

$$S_t = S_0 \exp\left[\left(\mu - \frac{\sigma^2}{2}\right)t + \sigma W_t\right]$$

### 1.3 Distribution of Log-Returns

For discrete time intervals $\Delta t$, the log-return is:

$$r_t = \ln\left(\frac{S_{t+\Delta t}}{S_t}\right) = \left(\mu - \frac{\sigma^2}{2}\right)\Delta t + \sigma (W_{t+\Delta t} - W_t)$$

Since $W_{t+\Delta t} - W_t \sim \mathcal{N}(0, \Delta t)$, we have:

$$r_t \sim \mathcal{N}\left(\left(\mu - \frac{\sigma^2}{2}\right)\Delta t, \, \sigma^2 \Delta t\right)$$

For daily returns with $\Delta t = 1/252$ trading years, the daily variance is $\sigma^2/252$ and the daily standard deviation is $\sigma/\sqrt{252}$.

### 1.4 Simulation Results

The animation below shows how quickly identical assumptions can lead to different realized paths. I simulate 20 GBM paths using parameters calibrated to S&P 500 data ($\mu = 0.12$, $\sigma = 0.214$ annualized).

![GBM Path Evolution](figures/anim1_gbm_paths.mp4)

*Animation 1: Twenty GBM paths evolving over one trading year (252 days). All paths start at $S_0 = 100$ with identical parameters, but independent Brownian increments make them fan out over time. The spread grows with $\sqrt{t}$, as predicted by the diffusion term.*

The static analysis is consistent with the model's theoretical predictions:

![Figure 1: Geometric Brownian Motion Foundations](figures/fig1_gbm_foundations.png)

*Figure 1: GBM foundations. Top left: multiple price paths with the characteristic fan-out pattern. Top right: log-return distribution closely matching the theoretical $\mathcal{N}(\mu_M, \sigma_M^2)$. Bottom left: terminal prices with the expected lognormal right skew. Bottom right: rolling volatility fluctuating around the calibrated σ = 21.4%.*

---

## Section 2: The Three-Variable Model

GBM gives us a useful base model, but it is too compressed for the question I care about here. To separate different kinds of uncertainty, I use three random variables, each with its own distribution and dependence assumptions.

### 2.1 Variable 1: Market Returns $R_M$

Let $R_M$ represent daily log-returns on the aggregate market index, here the S&P 500. Under the GBM assumptions:

$$R_M \sim \mathcal{N}(\mu_M, \sigma_M^2)$$

**Calibration to S&P 500 (2020-2024):**
- Sample size: 1,256 trading days
- Estimated daily drift: $\mu_M = 0.000474$
- Estimated daily volatility: $\sigma_M = 0.013504$
- Annualized volatility: $\sigma_M \cdot \sqrt{252} \approx 21.4\%$

### 2.2 Variable 2: Sector Volatility $V_S$ (Conditional Specification)

Sector-specific volatility should not be independent of market conditions. When the market moves sharply, sector volatility often rises too. I model that dependence with a conditional log-normal specification:

$$V_S \mid R_M \sim \text{LogNormal}(\alpha + \beta |R_M|, \, \tau^2)$$

Equivalently, the logarithm of sector volatility is conditionally normal:

$$\log(V_S) \mid R_M \sim \mathcal{N}(\alpha + \beta |R_M|, \tau^2)$$

The absolute value $|R_M|$ captures a symmetric market-magnitude effect: large market moves in *either* direction tend to increase sector volatility. This is related to volatility clustering, but it is not a full leverage-effect model because negative and positive returns enter with the same magnitude.

**Model Parameters:** These values are illustrative scenario parameters chosen to make the dependence structure visible. The market return parameters are calibrated from S&P 500 data; $\alpha$, $\beta$, and $\tau$ are not separately estimated from sector data in this post.
- $\alpha = -3.5$ (baseline log-volatility)
- $\beta = 15.0$ (sensitivity to market magnitude)
- $\tau = 0.3$ (idiosyncratic volatility noise)

The conditional expectation is:

$$\mathbb{E}[V_S \mid R_M = r] = \exp\left(\alpha + \beta|r| + \frac{\tau^2}{2}\right)$$

This creates a U-shaped relationship. $\mathbb{E}[V_S \mid R_M]$ is minimized when $R_M = 0$ and increases as $|R_M|$ grows.

The next animation makes that conditional structure easier to see. As $R_M$ moves away from zero, the distribution of $V_S | R_M$ shifts toward higher volatility:

![Conditional Distribution Sweep](figures/anim6_conditional_sweep.mp4)

*Animation 2: Conditional distributions $V_S|R_M$ sweeping from $R_M = -0.03$ to $+0.03$. Left panel: the distribution shifts rightward as $|R_M|$ increases. Right panel: the red line tracks the current $R_M$ on the joint density heatmap. The info bar shows the U-shaped conditional expectation.*

### 2.3 Variable 3: Exogenous Shock $Z$ (Independent)

The third variable represents events outside the day-to-day market mechanism: geopolitical disruptions, policy surprises, or sudden sector-specific news. I treat this component as structurally independent of the normal market-return and sector-volatility variables.

I model $Z$ as a **compound Poisson process**:

$$Z = \sum_{i=1}^{N} J_i$$

where:
- $N \sim \text{Poisson}(\lambda)$ counts the number of shocks (jumps) per period
- $J_i \sim \mathcal{N}(\mu_J, \sigma_J^2)$ are i.i.d. jump magnitudes
- $\lambda = 0.05$ (5% daily probability of a shock)
- $\mu_J = 0$, $\sigma_J = 0.02$

**Critical Independence Assumption:**

$$Z \perp\!\!\!\perp (R_M, V_S)$$

The exogenous shock is statistically independent of both market returns and sector volatility. This is a modeling assumption, not a claim that every real-world shock is perfectly isolated. The point is to study what becomes possible when one risk source can be separated cleanly from the others.

![Jump Process Evolution](figures/anim4_jump_process.mp4)

*Animation 3: Compound Poisson jump process over 252 trading days. Top: cumulative shock value $Z(t)$ with discrete jumps marked by red stars. Between jumps, $Z(t)$ remains constant because there is no continuous drift component. Bottom: jump counting process $N(t)$ following Poisson(λ), with the empirical jump rate converging toward the theoretical 5%.*

---

## Section 3: Independence and Joint Distributions

The independence assumption for $Z$ is where the model becomes especially useful. It gives the joint distribution a simple factorization and creates a covariance matrix with a clean separated block.

### 3.1 Joint Density Factorization

For random variables $X$ and $Y$, independence implies $f_{X,Y}(x,y) = f_X(x) \cdot f_Y(y)$.

In our three-variable system:

$$f_{R_M, V_S, Z}(r, v, z) = f_{R_M, V_S}(r, v) \cdot f_Z(z)$$

The important subtlety is that only the shock variable separates. The joint density of $(R_M, V_S)$ does *not* factorize because sector volatility is conditional on market returns:

$$f_{R_M, V_S}(r, v) = f_{V_S|R_M}(v|r) \cdot f_{R_M}(r) \neq f_{V_S}(v) \cdot f_{R_M}(r)$$

This partial-independence structure is common in financial modeling: one part of the system is linked internally, while another component is treated as independent.

### 3.2 Covariance Under Independence

Independence between $Z$ and the market variables gives zero covariance:

$$\text{Cov}(R_M, Z) = \mathbb{E}[R_M Z] - \mathbb{E}[R_M]\mathbb{E}[Z] = \mathbb{E}[R_M]\mathbb{E}[Z] - \mathbb{E}[R_M]\mathbb{E}[Z] = 0$$

Similarly, $\text{Cov}(V_S, Z) = 0$.

The pair $(R_M, V_S)$ is different. Because $V_S$ is defined conditionally on $R_M$, their covariance is not forced to be zero. Using the law of total covariance:

$$\text{Cov}(R_M, V_S) = \mathbb{E}[\text{Cov}(R_M, V_S | R_M)] + \text{Cov}(\mathbb{E}[R_M|R_M], \mathbb{E}[V_S|R_M])$$

Since $\text{Cov}(R_M, V_S | R_M) = 0$ (conditioning on $R_M$ makes $R_M$ fixed):

$$\text{Cov}(R_M, V_S) = \text{Cov}\left(R_M, \exp\left(\alpha + \beta|R_M| + \frac{\tau^2}{2}\right)\right)$$

With a perfectly symmetric zero-mean return distribution, the covariance between $R_M$ and an even function of $R_M$ could vanish. In this calibrated setting, the small positive drift and finite-sample simulation produce a small positive empirical covariance. The stronger point is dependence: $V_S$ changes with $|R_M|$, while $Z$ remains separate.

### 3.3 The Block-Diagonal Covariance Matrix

The full covariance matrix exhibits block-diagonal structure:

$$\Sigma = \begin{pmatrix} \sigma_M^2 & \text{Cov}(R_M, V_S) & 0 \\ \text{Cov}(R_M, V_S) & \text{Var}(V_S) & 0 \\ 0 & 0 & \text{Var}(Z)\end{pmatrix}$$

The zeros in the third row and column are direct consequences of independence. This structure gives us:
1. **Factored computation**: Joint probabilities decompose into products
2. **Risk separation**: Exogenous shock exposure can be modeled as a separate risk component
3. **Simplified inference**: Parameters can be estimated separately

### 3.4 Simulation Diagnostics

With 100,000 Monte Carlo simulations, we can check whether the simulated data behaves the way the assumptions say it should. These are diagnostics, not proofs: low correlation and high Spearman p-values are consistent with the simulated independence assumption for $Z$, but they do not establish independence in general.

**Correlation Analysis:**

| Relationship | Empirical correlation | Calibrated expectation |
| --- | ---: | --- |
| $R_M$ and $Z$ | 0.002 | 0 |
| $V_S$ and $Z$ | 0.001 | 0 |
| $R_M$ and $V_S$ | 0.025 | $> 0$ |

**Spearman Rank Correlation Tests:**

| Relationship | $\rho$ | p-value | Decision |
| --- | ---: | ---: | --- |
| $R_M$ vs. $Z$ | 0.002 | 0.91 | Consistent with simulated independence |
| $V_S$ vs. $Z$ | 0.001 | 0.88 | Consistent with simulated independence |
| $R_M$ vs. $V_S$ | 0.024 | $< 0.001$ | Detects modeled dependence |

![Independence Diagnostics](figures/fig3_independence_validation.png)

*Figure 2: Independence diagnostics. Top row: scatter plots with 2σ confidence ellipses. The $(R_M, V_S)$ pair shows the modeled dependence, while the pairs involving $Z$ stay close to uncorrelated. Bottom left: correlation matrix with near-zero entries for $Z$. Bottom middle: block-diagonal covariance structure. Bottom right: Spearman p-values that are consistent with, but do not prove, the simulated independence assumption for $Z$.*

The joint density also becomes visible as the Monte Carlo sample grows:

![Joint Density Heatmap Build-up](figures/anim7_joint_density_heatmap.mp4)

*Animation 4: Joint density $f(R_M, V_S)$ emerging from 100 to 10,000 samples. White points show raw samples; contour colors reveal where density concentrates. The characteristic shape, with higher density near $R_M = 0$ and lower $V_S$, then wider spread for larger $|R_M|$, visualizes the conditional dependence structure.*

---

## Section 4: Simulation Framework with S&P 500 Data

### 4.1 Data and Calibration

For calibration, I use S&P 500 (^GSPC) daily data from January 2020 to December 2024. This window is useful because it contains several distinct regimes: the COVID-19 crash, the recovery, the 2022 bear market, and the 2023-24 rally.

![S&P 500 Evolution](figures/anim2_sp500_evolution.mp4)

*Animation 5: Historical S&P 500 price evolution, normalized to base 100, with synchronized 20-day rolling volatility. Key events are annotated: COVID crash bottom in March 2020, 2022 bear market onset, and the 2023 rally. Volatility clusters during crises and mean-reverts during calmer periods.*

**Parameter Summary:** Market return parameters are calibrated from S&P 500 data; the sector-volatility parameters are illustrative settings for the conditional model.

| Component | Parameter | Value | Interpretation |
| --- | --- | ---: | --- |
| Market returns | $\mu_M$ | 0.000474 | Daily drift |
| Market returns | $\sigma_M$ | 0.013504 | Daily volatility (21.4% annualized) |
| Sector volatility | $\alpha$ | -3.5 | Illustrative baseline |
| Sector volatility | $\beta$ | 15.0 | Illustrative magnitude sensitivity |
| Sector volatility | $\tau$ | 0.3 | Illustrative idiosyncratic noise |
| Exogenous shocks | $\lambda$ | 0.05 | Jump intensity (5% daily) |
| Exogenous shocks | $\mu_J$ | 0.0 | Mean jump size |
| Exogenous shocks | $\sigma_J$ | 0.02 | Jump volatility |

### 4.2 Historical Context

![Historical Data](figures/fig6_historical_context.png)

*Figure 3: S&P 500 empirical data (2020-2024). Top: price evolution showing the COVID crash, recovery, and later regimes. Bottom left: return distribution with a fitted normal, including slight excess kurtosis. Bottom right: rolling 20-day volatility showing regime changes and clustering.*

---

## Section 5: Risk Assessment - VaR and Expected Shortfall

### 5.1 Portfolio Loss Function

To connect the model to risk measurement, define portfolio loss as:

$$L = -w_1 R_M - w_2 \log(V_S) + w_3 |Z|$$

where $(w_1, w_2, w_3) = (1.0, 0.5, 0.3)$ are exposure weights. This is a stylized loss definition rather than a universal portfolio convention: positive market returns reduce loss, the log-volatility term captures exposure to sector conditions, and the absolute shock term treats shocks in either direction as costly.

### 5.2 Value at Risk (VaR)

For confidence level $\alpha$, Value at Risk is defined as:

$$\text{VaR}_\alpha = F_L^{-1}(\alpha) = \inf\{l : P(L \leq l) \geq \alpha\}$$

Because $L$ combines returns, log-volatility, absolute shocks, and arbitrary exposure weights, the reported VaR values are in **model loss units**. They should not be read directly as percentages or dollar losses.

**Simulation Results:**

| Confidence level | Value at Risk (model loss units) |
| ---: | ---: |
| 90% | 1.8750 |
| 95% | 1.9336 |
| 99% | 2.0388 |

### 5.3 Expected Shortfall (Conditional VaR)

Expected Shortfall looks past the threshold and measures the average loss in the tail:

$$\text{ES}_\alpha = \mathbb{E}[L \mid L \geq \text{VaR}_\alpha]$$

**Simulation Results:**

| Confidence level | Expected Shortfall (model loss units) |
| ---: | ---: |
| 90% | 1.9504 |
| 95% | 1.9987 |
| 99% | 2.0918 |

Here $\text{ES}_\alpha > \text{VaR}_\alpha$, as expected, because ES accounts for the severity of losses beyond the VaR threshold.

### 5.4 Variance Decomposition

The independence structure also makes the variance decomposition readable:

$$\text{Var}(L) = w_1^2 \text{Var}(R_M) + w_2^2 \text{Var}(\log V_S) + w_3^2 \text{Var}(|Z|) + 2w_1 w_2 \text{Cov}(R_M, \log V_S)$$

**Empirical Decomposition:**

| Component | Contribution |
| --- | ---: |
| Total variance | 0.02640 |
| Market ($R_M$) | 0.7% |
| Sector ($V_S$) | 98.9% |
| Exogenous ($Z$) | 0.0% |
| Cross-term | 0.4% |

Under these particular weights, sector volatility dominates the loss variance. That does not mean market returns or shocks are unimportant in every portfolio; it means this exposure profile is most sensitive to the sector-volatility term.

![Risk Distribution Evolution](figures/anim5_risk_distribution.mp4)

*Animation 6: Portfolio loss distribution building from 100 to 10,000 simulations. Left: histogram with VaR thresholds (90%, 95%, 99%) stabilizing. Right: VaR (red) and ES (blue) convergence, showing Monte Carlo estimation consistency.*

![Risk Analysis](figures/fig5_risk_analysis.png)

*Figure 4: Risk assessment summary. Top left: final loss distribution with VaR/ES markers. Top right: tail exceedance probability on a log scale. Bottom left: variance decomposition showing sector volatility dominance. Bottom middle: component-wise VaR contributions. Bottom right: Q-Q plot showing approximate normality with slight tail deviation.*

---

## Section 6: Extensions and Limitations

### 6.1 Potential Extensions

**Stochastic Volatility (Heston Model):**
Replace fixed volatility with a mean-reverting process:
$$dV_t = \kappa(\theta - V_t)dt + \xi\sqrt{V_t}dW_t^V$$

**Regime Switching:**
Allow parameters to switch between states, such as bull and bear markets, governed by a Markov chain.

**Copula-Based Dependence:**
Replace conditional specification with flexible copula structures for $(R_M, V_S)$.

### 6.2 Limitations

1. **Independence assumption**: True exogeneity is rare in interconnected markets
2. **Parameter stability**: Calibrated parameters may change across regimes
3. **Log-normal sector volatility**: May not capture all empirical features
4. **Jump timing**: Compound Poisson assumes independent, identically distributed arrival times

---

## Conclusion

This project started as a way to make the independence assumption concrete. Instead of saying "some shocks are independent" in words, the model makes that claim visible in the joint density, covariance matrix, and simulation output.

**Key Technical Contributions:**

1. **Joint density factorization**: Independence of $Z$ enables $f(r,v,z) = f(r,v) \cdot f(z)$, simplifying both analytical derivations and computational implementation.

2. **Block-diagonal covariance**: Zero covariances involving $Z$ support clean risk decomposition and separate treatment of exogenous shock exposure.

3. **Simulation diagnostics**: 100,000 Monte Carlo simulations produce diagnostics consistent with the simulated independence setup for $Z$ (correlations ≈ 0, Spearman p-values > 0.05) and the modeled dependence between $R_M$ and $V_S$.

4. **Risk decomposition**: Variance attribution shows that sector volatility dominates portfolio risk under the chosen weights, with exogenous shocks contributing marginally.

5. **Calibration to real data**: S&P 500 data (2020-2024) provides empirical grounding with annualized volatility σ ≈ 21.4%, consistent with post-COVID market regimes.

Combining GBM dynamics, conditional distributions, compound Poisson shocks, and explicit independence assumptions gives a framework that is analytically tractable and empirically grounded. For practitioners, the independence assumption should always be tested against the use case. For researchers, stochastic volatility, regime switching, and richer dependence models are natural next steps.

The central insight is simple but powerful: different sources of market risk interact in structured ways. Knowing which risks move together, and which can be treated separately, makes risk management and portfolio construction much more precise.

---

## References and Further Reading

- **Black, F. & Scholes, M.** (1973). The Pricing of Options and Corporate Liabilities. *Journal of Political Economy*.
- **Heston, S.L.** (1993). A Closed-Form Solution for Options with Stochastic Volatility. *Review of Financial Studies*.
- **Merton, R.C.** (1976). Option Pricing When Underlying Stock Returns Are Discontinuous. *Journal of Financial Economics*.
- **Cont, R.** (2001). Empirical Properties of Asset Returns: Stylized Facts and Statistical Issues. *Quantitative Finance*.
---

*Prepared for CSI 5138: Stochastic Processes*  
*Visualizations are generated from Monte Carlo simulations using S&P 500-calibrated market parameters and illustrative sector/shock assumptions*
