import { Meteor } from 'meteor/meteor'

import '../imports/client/routes'
import '../imports/lib/index'
import '../imports/client/common/index'
import '../imports/client/teams/index'
import '../imports/client/components/registerAll'

Meteor.users.deny({
    update() { return true; }
})
