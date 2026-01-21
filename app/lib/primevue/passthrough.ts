export default {
  select: {
    root: 'select',
    trigger: 'select__trigger',
    label: 'select__label',
    listcontainer: 'select__panel',
    list: 'select__list',
    dropdown: 'select__dropdown',
    option: ({ context }: any) => ({
      class: [
        'select__option',
        { 'select__option--active': context.selected }
      ]
    })
  }
};

