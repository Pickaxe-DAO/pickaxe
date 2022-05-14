const colors = require('tailwindcss/colors');

module.exports = {
    mode: 'jit',
    content: [
        './src/**/*.tsx',
        './public/index.html',
    ],
    theme: {
        extend: {
            colors: {
                popupsbg: colors.white,
                neutral: colors.yellow,
                primary: colors.zinc,
                primarytxt: colors.white,
                warning: colors.zinc,
                warningtxt: colors.white,
                error: colors.red,
                errortxt: colors.white,
            },
        },
    },
    variants: {
        fill:['hover', 'focus'],
    },
    plugins: [],
};
