/**
 * Class name utility using clsx and tailwind-merge
 */
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes intelligently
 * Prevents conflicting classes and combines them properly
 * @param {...string} classes - Classes to merge
 * @returns {string} merged class string
 */
export const cn = (...classes) => {
  return twMerge(clsx(...classes));
};

/**
 * Get responsive class
 * @param {object} sizes - Object with breakpoint keys and class values
 * @returns {string} responsive classes
 */
export const responsive = (sizes) => {
  return cn(
    sizes.base && sizes.base,
    sizes.sm && `sm:${sizes.sm}`,
    sizes.md && `md:${sizes.md}`,
    sizes.lg && `lg:${sizes.lg}`,
    sizes.xl && `xl:${sizes.xl}`,
    sizes['2xl'] && `2xl:${sizes['2xl']}`
  );
};
