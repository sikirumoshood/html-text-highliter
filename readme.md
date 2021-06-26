# How do we know what group of texts have a particular hightlight color?
> Create a map where every hightlight revisionHistory list is mapped to a color
> That way if a color is change, we can easily find all the nodes having IDs in the revisionHistory and update them to the new color

# How do we know if we have a partial selection ?
Partial selections currently do not have any effect the current algorithm as we always strip of the start and closing tags
of every search text just to get rid of cases where the Range API automatically adds a closing tag to correct the DocumentFragment.

# Example

```const Parser = require('./parser');
const htmlText = `<div class = 'content' id="content">
      <h1>
          This is <b>Magic!</b>
      </h1>
      <section class="description">
         <a href="google.com">Lorem ipsum dolor sit amet</a> consectetur adipisicing elit. Similique quasi illum veritatis repudiandae <i><b>eligendi magni iste,</b></i> voluptas adipisci architecto commodi nihil corporis quam, temporibus qui, dolorem reprehenderit quaerat a officiis.
      </section>
      <p>
        Something
          <b>different</b>
          <span>Right now</span>
          brand new <span> Long <code>life</code> </span>

      </p>
    </div>`;

const searchText = `<h1><b>Magic!</b>
      </h1>
      <section class="description">
         <a href="google.com">Lorem ipsum</a></section>`;

const searchTextParser = new Parser(htmlText, searchText, { prefix: 'volley-id-'});
const result = searchTextParser.parse();
console.log(':::: RESULT :::::', result);```

