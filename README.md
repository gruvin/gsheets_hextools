# HEX Tools or Google Sheets
## A Google Docs script, containing utilities for the [HEX](https://hex.com) Staker Class

Adds the following formulae to your Google Sheets document ...

### =HEXDAY()
Returns the current HEX day, in the local timezone. Day one commenced `2019-12-02 00:00:00 UTC`.

Example: `=HEXDAY()` => 367

### =HEXUSD()
Retrieves the current value of HEX in USD, according to Nomics.com

Example: `=HEXUSD()` => 123.45 :p

### =CurrencyRate(fromCode, toCode)

Example: `=CurrencyRate("NZD", "USD")`  => 0.702

### =HEXBalance(ETH_address)

Example: `=HEXBalance("0xF834b3E4040E13C5acd6a2Ed0D51592085863E7c")`

(Address from hex.vision [WALL OF SHAME](https://hex.vision/app/kibana#/dashboard/6bd47cf0-3676-11ea-8d7f-a79593d8efcc?_a=(description:'Total%20hex%20penalties%20over%20time%20range,%20wall%20of%20shame,%20penalties%20over%20time',filters:!(),fullScreenMode:!f,options:(hidePanelTitles:!f,useMargins:!t),panels:!((embeddableConfig:(title:''),gridData:(h:5,i:e6dce0ea-1276-4b82-93eb-5acea0e3d606,w:11,x:0,y:0),id:'037eacf0-335d-11ea-8d7f-a79593d8efcc',panelIndex:e6dce0ea-1276-4b82-93eb-5acea0e3d606,type:visualization,version:'7.7.0'),(embeddableConfig:(title:''),gridData:(h:5,i:c887a07e-9dd2-4489-a7b4-8d5951dc3725,w:36,x:11,y:0),id:f297a1b0-3b1f-11ea-8d7f-a79593d8efcc,panelIndex:c887a07e-9dd2-4489-a7b4-8d5951dc3725,type:visualization,version:'7.7.0'),(embeddableConfig:(vis:(legendOpen:!f)),gridData:(h:9,i:b68ab5b7-df26-490d-8f7e-d998a50b189a,w:24,x:0,y:5),id:'53f73720-3677-11ea-8d7f-a79593d8efcc',panelIndex:b68ab5b7-df26-490d-8f7e-d998a50b189a,type:visualization,version:'7.7.0'),(embeddableConfig:(),gridData:(h:5,i:'50b2f20a-4c30-42d3-9969-0d20d2c9940b',w:23,x:24,y:5),id:afbacc90-51a5-11ea-8d7f-a79593d8efcc,panelIndex:'50b2f20a-4c30-42d3-9969-0d20d2c9940b',type:visualization,version:'7.7.0'),(embeddableConfig:(),gridData:(h:28,i:'88968b92-d82d-4645-99a6-1942fc323cb1',w:23,x:24,y:10),id:c9589c30-51a6-11ea-8d7f-a79593d8efcc,panelIndex:'88968b92-d82d-4645-99a6-1942fc323cb1',type:visualization,version:'7.7.0'),(embeddableConfig:(),gridData:(h:24,i:bb6101fc-327b-401d-8407-2e564a91967b,w:24,x:0,y:14),id:'1a8148f0-3677-11ea-8d7f-a79593d8efcc',panelIndex:bb6101fc-327b-401d-8407-2e564a91967b,type:search,version:'7.7.0')),query:(language:kuery,query:''),timeRestore:!t,title:'HEX%20Penalties',viewMode:view)&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:'2019-12-03T00:00:00.000Z',to:now))))


### External Data Sources

#### Etherscan.org
Used by `HEXBalance()`. You will need your own [Etherscan API Key](https://etherscan.io/myapikey).

#### Nomics.com
Used by `HEXUSD()`. You will need your own [Nomics API Key](https://p.nomics.com/cryptocurrency-bitcoin-api/).

#### FloatRates.com
Used by `CurrencyRate()`. 

All great sites! You should total check them out, if you haven't already.

### How to Install

- Open your Google Sheets document. 
- Select **Tools** / **Script Editor**. A new browser tab should open.
- Copy the full `HEXTools` Google Docs script code from [here](https://github.com/gruvin/hextools_for_gsheets/blob/main/HEXTools.gs) and paste it into your own script.
- Copy/Paste your Etherscan and Nomics API keys, where directed at the top of the script.
- Select **File** / **Save**
- Return to you Google Sheet docs and reload the page.

You should get a new, **HEX Tools** menu item, to right of Help. You shouldn't have to use it very often, but there's an **Update Data** function in there to reread all data in the current sheet.

Now you should be able to use the examples functions, as shown above. Good luck and have fun! :-)

gruvin

### No stake data?
This would require a public Web API, tailored to making HEX ERC20 contract calls — or some kind of Web3 library, ported for use in Google Docs scripting (javascript but ...? If anyne know s a path to this then please let me know. (Contact via my Github profile.)

### Excel?
I looked into doing an Excel version of this but OMFG, what a mess! Far to much work and even then the user would have to learn to much, just to use it. Damnit Micros0ft, you aint never gonna change.


