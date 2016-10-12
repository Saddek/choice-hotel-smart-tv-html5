var USER = {
    MALE: 'male',
    FEMALE: 'female'
};
var User = {
    id: '',
    region: '',
    username: '',
    sex: '',
    salutation: function() {
        return this.sex == USER.MALE ? 'Mr.' : 'Ms.';
    }
};