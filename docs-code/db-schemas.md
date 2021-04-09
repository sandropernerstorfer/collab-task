<h1>MongoDB Schemas</h1>

---------------------------------------------------------------------------

#### USER
    name: REQUIRED STRING
    email: REQUIRED STRING
    password: REQUIRED STRING
    sessionid: REQUIRED STRING
    desks: ARRAY of STRINGS
    sharedDesks: ARRAY of STRINGS
    invites: ARRAY of STRINGS
    image: STRING / default NULL

---------------------------------------------------------------------------

#### DESK
    name: REQUIRED STRING
    color: REQUIRED STRING
    admin: REQUIRED STRING
    members: ARRAY of STRINGS
    lists: ARRAY of SCHEMA(List)
    date: Date.now

---------------------------------------------------------------------------

#### LIST
    name: REQUIRED STRING
    tasks: ARRAY of SCHEMA(Task)
    order: Number / default 0

---------------------------------------------------------------------------

#### TASK
    name: REQUIRED STRING,
    description: STRING / default '',
    location: STRING / default NULL,
    date: Date.now

---------------------------------------------------------------------------