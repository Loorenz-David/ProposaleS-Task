# Discovery 01 — Account access and the hidden signup path

The assignment said to create a free Proposales account before using the API. That was supposed to be the trivial part.

Following the public flow, I ended up on a page where the signup option wasn't there. Not disabled, not behind a login wall — just not rendered anywhere I could see it.

Before concluding that self-signup wasn't available, I opened the developer tools and looked at the page itself: the DOM, and the links it actually contained. A valid signup route existed. It just wasn't presented in the visible interface at the point where I expected it.

I used that route directly and the account was created without any problem.

## What this actually established

Account creation worked. The obstacle was finding the path through the rendered public UI, not the absence of the capability.

I'm deliberately not going further than that. I don't know why the link wasn't visible on the page I landed on, and I didn't dig into their frontend to find out. Calling it a bug would be more than I observed.

I later messaged Rawan about the missing signup link, since from a product point of view that's a rough edge in the onboarding journey — the route exists, the UI just doesn't hand it to you.

The general lesson I took into the rest of this exercise: when something looks blocked, inspect the actual surface before deciding the capability doesn't exist. That habit came up again later, in a much more interesting way, when I went looking for a way to send a proposal.

With an account in hand, the next question was what API I actually had.
