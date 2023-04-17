import { Builder } from '../builder';

export const locationConcatTransform = () =>
    // Used to replace the pattern:
    // LOCATION += VALUE
    Builder.create(
        `
            LOCATION.assign(LOCATION.href + VALUE)
        `,
        {
            name: 'locationConcatTransform',
            globals: { LOCATION: 'location' },
        }
    );
