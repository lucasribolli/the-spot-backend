https://the-spot-backend.herokuapp.com/

## Deploy to Heroku
Source: https://stackoverflow.com/questions/71892543/heroku-and-github-items-could-not-be-retrieved-internal-server-error


Install [Heroku Cli](https://devcenter.heroku.com/articles/heroku-cli)


> heroku git:remote -a the-spot-backend

> git remote -v

The command above should shows
```
heroku  https://git.heroku.com/the-spot-backend.git (fetch)
heroku  https://git.heroku.com/the-spot-backend.git (push)
```

Deploy new versions to heroku using git
> git push heroku master