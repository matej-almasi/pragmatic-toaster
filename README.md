# Pragmatic Toaster

A simple extension that displays toast a notification with a randomly selected [tip]
from the [Pragmatic Programmer] book.

[tip]: https://pragprog.com/tips/
[Pragmatic Programmer]: https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/

## Features

Display a random Pragmatic tip on demand by typing a command . . .
![Command](https://raw.githubusercontent.com/matej-almasi/pragmatic-toaster/main/images/command.png)

. . . and (or) every few saves (you can configure the frequency yourself!)
![Pragmatic tip](https://raw.githubusercontent.com/matej-almasi/pragmatic-toaster/main/images/toast.png):

## Extension Settings

This extension contributes the following settings:

- `pragmaticToaster.minSaves`: Minimum number of file saves before a Pragmatic tip is shown.
- `pragmaticToaster.minSaves`: Maximum number of file saves before a Pragmatic tip is shown.

Set both `minSaves` and `maxSaves` to the same number to set a fixed interval for showing the
tips. Set both to `0` to completely disable the showing of tips on file saves.

## Attributions

Beautiful [Carpenter icon] created by [imaginationlol], sourced from [Flaticon].

TODO: approval from Prag Prog.

[Carpenter icon]: https://www.flaticon.com/free-icon/wood-plane_4854604?term=wood+plane&page=1&position=30&origin=search&related_id=4854604
[imaginationlol]: https://www.flaticon.com/authors/imaginationlol
[Flaticon]: https://www.flaticon.com/

## Release Notes

### 0.1.0

Initial release of Pragmatic Toaster.
