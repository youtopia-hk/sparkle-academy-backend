import slugify from 'slugify';

export const createSlug = (text: string): string => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

export const createUniqueSlug = async (
  text: string,
  Model: any,
  excludeId?: string
): Promise<string> => {
  let slug = createSlug(text);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const query: any = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await Model.findOne(query);

    if (!existing) {
      isUnique = true;
    } else {
      slug = `${createSlug(text)}-${counter}`;
      counter++;
    }
  }

  return slug;
};
