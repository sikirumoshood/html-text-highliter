const StringUtility = require("./utils/string.utility");
const {v4:uuidv4} = require('uuid');

class Parser {
    constructor(htmlText = '', searchText = '', options = {}){
        this.htmlText = StringUtility.Stringify(htmlText);
        this.originalSearchText = StringUtility.Stringify(searchText);
        this.searchText = this.originalSearchText;
        this.searchText = StringUtility.StartsWithTag(this.searchText) ? StringUtility.RemoveFirstOpeningTag(this.searchText) : this.searchText;
        this.searchText = StringUtility.EndsWithTag(this.searchText) ? StringUtility.RemoveLastClosingTag(this.searchText) : this.searchText;
        this.options = options;
        this.highlightedHtmlResult = this.htmlText;
        this.processedSearchText = this.searchText;
        this.changeRevisions = [];
        this.leftHtmlText = '';
        this.rightHtmlText = '';
        this.wordsInsertedSoFar = '';
    }

    _updateChangeRevision (changeText, index, id) {
        const { prefix = '' } = this.options;
        const revision = {
            id: `${prefix}${id}`,
            text: changeText,
            startIndex: index,
            currentProcessedSearchText: this.processedSearchText
        }

        this.changeRevisions.push(revision);
    }

    _getHighlightedHtmlResult () {
        const searchIndex = this.htmlText.indexOf(this.searchText);
        
        if(searchIndex < 0){
            // Match not found
            return this.htmlText;
        }

        this.leftHtmlText = this.htmlText.substr(0, searchIndex);
        this.rightHtmlText = this.htmlText.substr(this.searchText.length + searchIndex);
        return `${this.leftHtmlText}${this.processedSearchText}${this.rightHtmlText}`; 
    }

    _getNewIndexAfterRevisions (index) {
        if(index === 0) {
            return index;
        }
        index = this.wordsInsertedSoFar.length + index;
        return index;
    }

    _getNewSpan (isLast) {
        const id = uuidv4();
        const { prefix = '' } = this.options;
        const spanText = isLast ? '</span>' : `<span id='${prefix}${id}'>`;
        const span = {
            text: spanText,
            id: id
        }
        return span;
    }

    _saveUpdate (optons) {
        const { spanText, index, id } = optons;
        const leftPartIncludingCharAtIndex = this.processedSearchText.substr(0, index);
        const rightPart = this.processedSearchText.substr(index);
        if(leftPartIncludingCharAtIndex === ''){
            this.processedSearchText = `${spanText}${rightPart}`;
        }else{
            this.processedSearchText = `${leftPartIncludingCharAtIndex}${spanText}${rightPart}`;
        }
        this.wordsInsertedSoFar += spanText;
        this._updateChangeRevision(spanText, index, id);
    }

    _insertSpan (index, isLast = false) {
        const {text:spanText, id} = this._getNewSpan(isLast);
        index = this._getNewIndexAfterRevisions(index, isLast);
        return this._saveUpdate({spanText, index, id, isBeginning: false});
    } 

    parse () { 
        /**
         * nonTagSeen flag is used to signal when we've seen a character
         * that is not a tag (i.e '<') or LESS_THAN_CHAR
         * Note: any character other than '<' is considered non tag.
         */
        let nonTagSeen = false;
        
        /**
         * startTagSeen flag is used to signal when we've seen a left tag 
         * this is typically '<' or LESS_THAN_CHAR
         */
        let startTagSeen = false;

        /**
         * We need to know when we started seeing a character 
         * that will form a word at the end of the scan
         */
        let startIndex = null;

        for(let i = 0; i < this.searchText.length; ++i){
            const char = this.searchText[i];
            const weAreAtTheLastChar = (i === this.searchText.length - 1)
            if(!StringUtility.IsStartTag(char)){
                // We have seen a tag previously and we are yet to see the closing tag
                if(startTagSeen){
                    if(char === StringUtility.CharList().GREATER_THAN_CHAR){
                        // look ahead
                        nonTagSeen = false; 
                        // Reset
                        startIndex = i;
                        startTagSeen = false;
                        continue;
                    }else{
                        // Look for closing tag '>'
                        startIndex = i;
                        continue;
                    } 
                }else{
                    if(!nonTagSeen){
                        startIndex = i; 
                        nonTagSeen = true;
                    }else{
                        if(weAreAtTheLastChar){
                            // Opening span
                            this._insertSpan(startIndex);

                            // Closing span
                            const isLast = true;

                            /***
                             * There's no look ahead so we need to add 1 to the end index
                             * To cover for the string manipulations later on e.g substr(x, y) 
                             * does not include y so it gets strings to y - 1, to include y
                             * We add 1
                             */
                            
                            this._insertSpan((i + 1), isLast);
                            break;
                        }else{
                            // Look ahead for more non tags
                            continue
                        }
                        
                    }
                }
                
            }else{
                /**
                 * We've seen a tag
                 * We should always have our previousTagSeen set to true because
                 * The search text will always start with text and not a tag
                 */
                if(startTagSeen){
                    if(char === StringUtility.CharList().GREATER_THAN_CHAR){
                        // look ahead
                        nonTagSeen = false;
                        // Reset
                        startIndex = i;
                        startTagSeen = false;
                    }else{
                        // Look for closing tag
                        continue;
                    } 
                }else{
                    startTagSeen = true
                    // We've seen a text non tag
                    if(nonTagSeen){
                        // Opening span               
                        this._insertSpan(startIndex);

                        // Closing span
                        const isLast = true;
                        this._insertSpan(i, isLast);
                    }
                }

                startIndex = i;
                nonTagSeen = false;
                
                /**
                 * Keep skipping until we see end tag >
                 */

            }

            // Last char resort
            // Can we still get here 🤷‍♂?
            if(weAreAtTheLastChar){
                if(startTagSeen){
                    // There must be a closing tag
                    throw new Error('Invalid text input')
                }
                const isLast = true;
                // Opening span
                this._insertSpan(startIndex);

                // Closing
                this._insertSpan(i + 1, isLast);
                break;
            }

        }

        return {
            revisionHistory: this.changeRevisions,
            processedSearchText: this.processedSearchText,
            totalWordsProcessed: this.wordsInsertedSoFar,
            highlightedHtmlResult: this._getHighlightedHtmlResult(),
            searchText: this.originalSearchText,
            formattedSearchText: this.searchText,
        }
    }
};

module.exports = Parser;
