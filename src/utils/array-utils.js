const { floor } = require("lodash");

module.exports = {
    shuffle: (arr) => {
        var result = [...arr];

        for (let i = result.length - 1; i > 0; i--) {
            let j = floor((i + 1) * Math.random());

            if(j !== i) {
                var temp = result[i];
                result[i] = result[j];
                result[j] = temp;
            }
        }

        return result;
    }
}