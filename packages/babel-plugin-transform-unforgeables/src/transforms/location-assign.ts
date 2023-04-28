import { Builder } from '../builder';

export const locationAssignTransform = () =>
    // Used to replace the pattern:
    // LOCATION = VALUE
    Builder.create(
        `
            LOCATION.assign(VALUE)
        `,
        {
            name: 'locationAssignTransform',
            globals: { LOCATION: 'location' },
        }
    );
