import yfinance as yf
stock = yf.Ticker("RELIANCE.NS")
hist = stock.history(period="2d")
print(hist)