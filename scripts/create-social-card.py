from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
img=Image.new("RGB",(1200,630),"#f2f7f4")
d=ImageDraw.Draw(img)
fontdir=Path("C:/Windows/Fonts")
def font(size,bold=False):
    return ImageFont.truetype(str(fontdir/("seguisb.ttf" if bold else "segoeui.ttf")),size)
d.rounded_rectangle((64,54,1136,576),radius=30,fill="white",outline="#dfe9e3",width=2)
d.text((105,90),"TradeDairy",font=font(38,True),fill="#006948")
d.text((105,185),"Your trades.",font=font(66,True),fill="#12251e")
d.text((105,263),"Your process. Your journal.",font=font(58,True),fill="#12251e")
d.text((105,385),"Trading journal  ·  Brokerage calculator",font=font(27),fill="#52685b")
d.text((105,432),"Record actual executions. Review net performance.",font=font(25),fill="#52685b")
d.text((105,513),"www.tradedairy.online",font=font(22,True),fill="#006948")
Path("public").mkdir(exist_ok=True)
img.save("public/social-card.png",optimize=True)

