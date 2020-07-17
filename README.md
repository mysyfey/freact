# freact, a react that's easier to use and understand.

As a challenge to myself, I have managed to re-create react from scratch, without ever having read react's source code beforehand.

freact allows you to easily build Web UIs using almost the same API as react, it is very simple to use, and quite powerful as it has most of react's principle features: virtual DOM, stateful component, etc. (It lacks the Context feature as of now, but I vow to remedy that someday soon.)

Of course, freact is never meant to be a product-level project(though I did have fun building UIs with it, it runs pretty well with babel), actually the whole purpose of it is to show coders who are still learning, how react really works under the hood and how simple its core principles really are, and help them have a complete understanding of react. I sure did writing it.

And the whole process was so much fun for me, that it evolved into a big plan of creating a brand-new freact family.

So here are some other well-known components that I wrote:
 - react-router (unfortunately it cannot run with freact because no Context feature).
 - CSSTransition.
 - a little expandable component based on my CSSTransition.
 - and an ambitious react-redux, but sadly it's not yet completed, hopefully I would get around to wrap it up after finishing Context.
