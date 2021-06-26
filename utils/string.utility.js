
class StringUtility {
    static CharList () {
        return {
            LESS_THAN_CHAR: '<',
            GREATER_THAN_CHAR: '>'
        }
    }
    
    static IsStartTag(char) {
        return char === StringUtility.CharList().LESS_THAN_CHAR
    }

    static StartsWithTag(searchText) {
        return searchText[0] === StringUtility.CharList().LESS_THAN_CHAR
    }

    static EndsWithTag(searchText) {
        return searchText[searchText.length - 1] === StringUtility.CharList().GREATER_THAN_CHAR
    }

    static RemoveText(text, startTagIndex, endTagIndex){
        const leftPartOfStartTag = text.substr(0, startTagIndex);
        const rightPartOfEndTag = text.substr(endTagIndex + 1);
        const newSearchText = `${leftPartOfStartTag}${rightPartOfEndTag}`;
        return newSearchText;
    }

    static RemoveFirstOpeningTag(searchText) {
        const { searchText: newSearchText } = StringUtility.lookupForIndexesForTheNextOpeningTag(searchText);
        
        if(newSearchText[0] === StringUtility.CharList().LESS_THAN_CHAR) {
        	return StringUtility.RemoveFirstOpeningTag(newSearchText);
        }else{
            return newSearchText;
        }
    }
    
    static lookupForIndexesForTheNextOpeningTag(searchText) {
    	let startTagIndex;
        let endTagIndex;
        let startTagSeen = false;

        for(let i = 0; i < searchText.length; ++i) {
            if(!startTagSeen && searchText[i] === StringUtility.CharList().LESS_THAN_CHAR){
                startTagIndex = i;
                startTagSeen = true;
            }

            if(searchText[i] === StringUtility.CharList().GREATER_THAN_CHAR){
                endTagIndex = i;
                break;
            }
        }
        
        searchText = StringUtility.RemoveText(searchText, startTagIndex, endTagIndex);
        return { startTagIndex, endTagIndex, searchText };
    
    }
    
    static lookupForIndexesForTheNextClosingTag(searchText, startIndex = null) {
    	let startTagIndex;
        let endTagIndex;
        let endTagSeen = false;
        
        for(let i = startIndex || searchText.length - 1; i >= 0; --i) {
            if(!endTagSeen && searchText[i] === StringUtility.CharList().GREATER_THAN_CHAR){						 
                endTagIndex = i;
                endTagSeen = true;
            }

            if(searchText[i] === StringUtility.CharList().LESS_THAN_CHAR){
                startTagIndex = i;
                break;
            }
        }
        
        searchText = StringUtility.RemoveText(searchText, startTagIndex, endTagIndex);
        return { startTagIndex, endTagIndex, searchText };
    
    }

    static RemoveLastClosingTag(searchText, startIndex = null) {
        const { startTagIndex, searchText: newSearchText } = StringUtility.lookupForIndexesForTheNextClosingTag(searchText, startIndex);
        
        if(searchText[startTagIndex - 1] === StringUtility.CharList().GREATER_THAN_CHAR) {
        	return StringUtility.RemoveLastClosingTag(newSearchText, startTagIndex - 1);
        }else{
        	return newSearchText;
        }
  
    }

    static Stringify(htmlText) {
        return htmlText.split('\n').join('');
    }
};

module.exports = StringUtility;
