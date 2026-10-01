# Historical chart data

`sp500-monthly.json` contains the 60 monthly S&P 500 observations from January 2020 through December 2024, rounded to two decimals, from:

https://raw.githubusercontent.com/datasets/s-and-p-500/main/data/data.csv

Retrieved 2026-09-29. Dataset documentation and provenance:
https://github.com/datasets/s-and-p-500

The upstream dataset combines the Robert Shiller monthly series through June 2023 with an extension from FRED. Only Date and SP500 are used. These monthly levels are for historical context; they are not the original project's daily calibration observations. Return charts use differences of log monthly levels. Rolling volatility uses six monthly returns, sample standard deviation, and a square-root-of-12 annualization factor.

All other charts use local seeded simulations. No historical observations are synthesized or interpolated from the old figure images.
