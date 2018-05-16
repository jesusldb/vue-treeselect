import { mount } from '@vue/test-utils'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import { generateOptions, leftClick, findMenu, findOptionByNodeId } from './shared'

describe('Menu', () => {
  it('should blur the input & close the menu after clicking anywhere outside the component', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
    })
    const { vm } = wrapper

    vm.openMenu()
    const event = document.createEvent('event')
    event.initEvent('mousedown', true, true)
    document.body.dispatchEvent(event)
    expect(vm.isFocused).toBe(false)
    expect(vm.isOpen).toBe(false)
  })

  it('should open the menu after clicking the control when focused', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [],
      },
      data: {
        isFocused: true,
      },
    })
    const valueContainer = wrapper.find('.vue-treeselect__value-container')

    leftClick(valueContainer)
    expect(wrapper.vm.isOpen).toBe(true)
  })

  it('click on option arrow should toggle expanded', () => {
    const wrapper = mount(Treeselect, {
      attachToDocument: true,
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
          children: [],
        } ],
      },
      data: {
        isOpen: true,
      },
    })
    const { a } = wrapper.vm.nodeMap

    expect(a.isExpanded).toBe(false)
    const optionArrow = findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__option-arrow-container')
    leftClick(optionArrow)
    expect(a.isExpanded).toBe(true)
    leftClick(optionArrow)
    expect(a.isExpanded).toBe(false)
  })

  it('should highlight the option when the cursor hovering over it', () => {
    const wrapper = mount(Treeselect, {
      propsData: {
        options: [ {
          id: 'a',
          label: 'a',
        }, {
          id: 'b',
          label: 'b',
        } ],
      },
    })
    const { vm } = wrapper

    vm.openMenu()
    expect(vm.current).toBe('a')

    findOptionByNodeId(wrapper, 'b').trigger('mouseenter')
    expect(vm.current).toBe('b')

    findOptionByNodeId(wrapper, 'a').trigger('mouseenter')
    expect(vm.current).toBe('a')
  })

  it('retain scroll position on menu reopen', async () => {
    const maxHeight = 100
    const wrapper = mount(Treeselect, {
      propsData: {
        options: generateOptions(3),
        defaultExpandLevel: Infinity,
        maxHeight,
      },
      attachToDocument: true,
    })
    const { vm } = wrapper

    let i = 3
    let pos = 0
    const step = 20
    while (i--) {
      vm.openMenu()
      await vm.$nextTick()
      const menu = findMenu(wrapper)
      expect(menu.element.scrollHeight).toBeGreaterThan(maxHeight)
      expect(menu.element.scrollTop).toBe(pos)
      pos += step
      menu.element.scrollBy(0, step)
      vm.closeMenu()
      await vm.$nextTick()
    }
  })
})
