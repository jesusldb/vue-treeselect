import Vue from 'vue'
import { mount } from '@vue/test-utils'
import sleep from 'yaku/lib/sleep'
import Treeselect from '@riophae/vue-treeselect/components/Treeselect'
import TreeselectOption from '@riophae/vue-treeselect/components/Option'
import { UNCHECKED, CHECKED } from '@riophae/vue-treeselect/constants'
import {
  leftClick,
  typeSearchText,
  findInput,
  findMenu,
  findOptionByNodeId,
  findLabelWrapperByNodeId,
} from './shared'

function createArray(len, fn) {
  const arr = []
  let i = 0
  while (i < len) arr.push(fn(i++))
  return arr
}

function generateOptions(maxLevel) {
  const generate = (i, level) => {
    const id = String.fromCharCode(97 + i).repeat(level)
    const option = { id, label: id.toUpperCase() }
    if (level < maxLevel) option.children = [ generate(i, level + 1) ]
    return option
  }

  return createArray(maxLevel, i => generate(i, 1))
}

describe('Props', () => {
  describe('alwaysOpen', () => {
    it('should auto open the menu on mount', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(true)
    })

    it('should hide the arrow', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      await vm.$nextTick() // the arrow exists on first render
      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(false)
    })

    it('the menu should be unclosable', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      vm.closeMenu()
      expect(vm.isOpen).toBe(true)
    })

    it('when disabled=true, should not auto open the menu on mount', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: true,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(false)
    })

    it('set disabled=true should close the already opened menu', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: false,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(true)
      wrapper.setProps({ disabled: true })
      expect(vm.isOpen).toBe(false)
    })

    it('set `disabled` from true to false should open the menu', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: true,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(false)
      wrapper.setProps({ disabled: false })
      expect(vm.isOpen).toBe(true)
    })

    it('should show the arrow when disabled', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
          disabled: true,
        },
      })

      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(true)
    })

    it('set `alwaysOpen` from `false` to `true` should open the menu and hide the arrow', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: false,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(false)
      wrapper.setProps({ alwaysOpen: true })
      expect(vm.isOpen).toBe(true)
      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(false)
    })

    it('set `alwaysOpen` from `true` to `false` should close the menu and show the arrow', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          alwaysOpen: true,
        },
      })
      const { vm } = wrapper

      expect(vm.isOpen).toBe(true)
      wrapper.setProps({ alwaysOpen: false })
      expect(vm.isOpen).toBe(false)
      expect(wrapper.contains('.vue-treeselect__arrow-wrapper')).toBe(true)
    })
  })

  describe('autofocus', () => {
    it('should focus the search input on mount', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          autofocus: true,
          searchable: true,
        },
      })
      const inputWrapper = findInput(wrapper)
      expect(document.activeElement).toBe(inputWrapper.element)
    })

    it('deprecated', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: [],
          autofocus: true,
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        '`autofocus` prop is deprecated. Use `autoFocus` instead.',
      )
    })
  })

  describe('autoFocus', () => {
    it('should focus the search input on mount', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          autoFocus: true,
          searchable: true,
        },
      })
      const inputWrapper = findInput(wrapper)
      expect(document.activeElement).toBe(inputWrapper.element)
    })
  })

  describe('beforeClearAll', () => {
    async function clickOnX(wrapper) {
      const x = wrapper.find('.vue-treeselect__x')
      leftClick(x)
      // the `beforeClearAll` callback is always called async
      // we have to wait here
      await sleep(0)
    }

    it('the returned value determines whether to clear values', async () => {
      let shouldClear
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
          value: 'a',
          beforeClearAll: () => shouldClear,
        },
      })
      const { vm } = wrapper

      shouldClear = false
      await clickOnX(wrapper)
      expect(vm.internalValue).toEqual([ 'a' ])

      shouldClear = true
      await clickOnX(wrapper)
      expect(vm.internalValue).toBeEmptyArray()
    })

    it('should support the callback returning a promise', async () => {
      let shouldClear
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
          value: 'a',
          beforeClearAll: () => Promise.resolve(shouldClear),
        },
      })
      const { vm } = wrapper

      shouldClear = false
      await clickOnX(wrapper)
      expect(vm.internalValue).toEqual([ 'a' ])

      shouldClear = true
      await clickOnX(wrapper)
      expect(vm.internalValue).toBeEmptyArray()
    })
  })

  describe('branchNodesFirst', () => {
    it('should place branch nodes ahead of leaf nodes when branchNodesFirst=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          branchNodesFirst: true,
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
            }, {
              id: 'bb',
              label: 'bb',
              children: [ {
                id: 'bba',
                label: 'bba',
              } ],
            }, {
              id: 'bc',
              label: 'bc',
            } ],
          }, {
            id: 'c',
            label: 'c',
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.normalizedOptions.map(node => node.id)).toEqual([ 'b', 'a', 'c' ])
      expect(vm.nodeMap.b.children.map(node => node.id)).toEqual([ 'bb', 'ba', 'bc' ])
    })
  })

  describe('clearable', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          multiple: false,
          clearable: true,
          options: [ { id: 'a', label: 'a' } ],
          value: 'a',
        },
      })
      vm = wrapper.vm
    })

    it('should show "×" icon', () => {
      expect(wrapper.contains('.vue-treeselect__x')).toBe(true)
    })

    it('should reset value on mousedown', async () => {
      expect(vm.selectedNodeIds).toEqual([ 'a' ])
      leftClick(wrapper.find('.vue-treeselect__x'))
      await sleep(1)
      expect(vm.selectedNodeIds).toEqual([])
    })

    it('should hide when no options selected', () => {
      vm.clear()
      expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
    })

    it('should hide when disabled=true', () => {
      wrapper.setProps({ disabled: true })
      expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
    })

    it('should hide when clearable=false', () => {
      wrapper.setProps({ clearable: false })
      expect(wrapper.contains('.vue-treeselect__x')).toBe(false)
    })
  })

  describe('clearAllText', () => {
    it('should be the title of "×" icon when multiple=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          clearable: true,
          multiple: true,
          clearAllText: '$MULTI_TITLE$',
          options: [ { id: 'a', label: 'a' } ],
          value: [ 'a' ],
        },
      })

      expect(wrapper.find('.vue-treeselect__x').attributes().title).toBe('$MULTI_TITLE$')
    })
  })

  describe('clearOnSelect', () => {
    describe('when multiple=false', () => {
      it('clears the input after selecting when clearOnSelect=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: true,
            multiple: false,
            options: [ { id: 'a', label: 'a' } ],
          },
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        expect(vm.searchQuery).toBe('')
      })

      it('still clears the input after selecting even if clearOnSelect!=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: false,
            multiple: false,
            options: [ { id: 'a', label: 'a' } ],
          },
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        expect(vm.searchQuery).toBe('')
      })
    })

    describe('when multiple=true', () => {
      it('clears the input after selecting when clearOnSelect=true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: true,
            multiple: true,
            options: [ { id: 'a', label: 'a' } ],
          },
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        expect(vm.searchQuery).toBe('')
      })

      it("won't clear the input after selecting when clearOnSelect!=true", () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            clearOnSelect: false,
            multiple: true,
            options: [ { id: 'a', label: 'a' } ],
          },
          data: {
            searching: true,
            searchQuery: '$SEARCH_QUERY$',
          },
        })
        const { vm } = wrapper

        vm.select(vm.nodeMap.a)
        expect(vm.searchQuery).toBe('$SEARCH_QUERY$')
      })
    })
  })

  describe('clearValueText', () => {
    it('should be the title of "×" icon when multiple=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          clearable: true,
          multiple: false,
          clearValueText: '$SINGLE_TITLE$',
          options: [ { id: 'a', label: 'a' } ],
          value: 'a',
        },
      })

      expect(wrapper.find('.vue-treeselect__x').attributes().title).toBe('$SINGLE_TITLE$')
    })
  })

  describe('closeOnSelect', () => {
    it('closes the menu after selecting when closeOnSelect=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          closeOnSelect: true,
          multiple: false,
          options: [ { id: 'a', label: 'a' } ],
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const labelWrapper = findLabelWrapperByNodeId(wrapper, 'a')

      leftClick(labelWrapper)
      expect(vm.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.isOpen).toBe(false)
    })

    it('keeps the menu open after selecting when closeOnSelect=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          closeOnSelect: false,
          multiple: false,
          searchable: true,
          options: [ { id: 'a', label: 'a' } ],
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const labelWrapper = findLabelWrapperByNodeId(wrapper, 'a')

      leftClick(labelWrapper)
      expect(vm.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.isOpen).toBe(true)
      expect(vm.isFocused).toBe(false) // auto blur
    })
  })

  describe('defaultExpandLevel', () => {
    it('when defaultExpandLevel=0', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [],
          } ],
          defaultExpandLevel: 0,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      expect(a.isExpanded).toBe(false)
    })

    it('when defaultExpandLevel=1', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [],
            } ],
          } ],
          defaultExpandLevel: 1,
        },
      })
      const { vm } = wrapper
      const { a, aa } = vm.nodeMap

      expect(a.isExpanded).toBe(true)
      expect(aa.isExpanded).toBe(false)
    })

    it('when defaultExpandLevel=Infinity', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [],
            } ],
          } ],
          defaultExpandLevel: Infinity,
        },
      })
      const { vm } = wrapper
      const { a, aa } = vm.nodeMap

      expect(a.isExpanded).toBe(true)
      expect(aa.isExpanded).toBe(true)
    })

    it('with `node.isDefaultExpanded`', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [],
            } ],
          }, {
            id: 'b',
            label: 'b',
            isDefaultExpanded: false,
            children: [ {
              id: 'bb',
              label: 'bb',
              isDefaultExpanded: true,
              children: [],
            } ],
          } ],
          defaultExpandLevel: 1,
        },
      })
      const { a, aa, b, bb } = wrapper.vm.nodeMap

      expect(a.isExpanded).toBe(true)
      expect(aa.isExpanded).toBe(false)
      expect(b.isExpanded).toBe(false)
      expect(bb.isExpanded).toBe(true)
    })

    it('should request children options loading when expanded', () => {
      // TODO: 需要考虑服务端渲染的情况
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions')
      const wrapper = mount(Treeselect, {
        propsData: {
          id: 'test',
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'bb',
              label: 'bb',
              children: null,
            } ],
          } ],
          defaultExpandLevel: 1,
          loadChildrenOptions,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      expect(loadChildrenOptions.calls.count()).toBe(1)
      expect(loadChildrenOptions).toHaveBeenCalledWith(a.raw, jasmine.any(Function), 'test')
    })
  })

  describe('disableBranchNodes', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          defaultExpandLevel: Infinity,
          flat: false,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: [ {
              id: 'leaf',
              label: 'leaf',
            } ],
          } ],
        },
      })
      vm = wrapper.vm
    })

    const getLabelWrapperOfBranchNode = () => {
      vm.openMenu() // ensure the menu is opened otherwise the options won't be displayed
      return findLabelWrapperByNodeId(wrapper, 'branch')
    }

    const getLabelWrapperOfLeafNode = () => {
      vm.openMenu() // ensure the menu is opened otherwise the options won't be displayed
      return findLabelWrapperByNodeId(wrapper, 'leaf')
    }

    const clickOnLabelOfBranchNode = () => {
      const labelWrapperOfBranchNode = getLabelWrapperOfBranchNode()
      leftClick(labelWrapperOfBranchNode)
    }

    describe('when disableBranchNodes=false', () => {
      beforeEach(() => {
        wrapper.setProps({ disableBranchNodes: false })
      })

      it('a branch node should have checkbox when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfBranchNode = getLabelWrapperOfBranchNode()

        expect(labelWrapperOfBranchNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('a leaf node should have checkbox too when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfLeafNode = getLabelWrapperOfLeafNode()

        expect(labelWrapperOfLeafNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('click on label of a branch node should toggle checking state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
        clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
      })

      it('click on label of a branch node should not toggle expanding state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.nodeMap.branch.isExpanded).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.nodeMap.branch.isExpanded).toBe(true)
      })

      it('click on label of a branch node should close the dropdown when multiple=false & closeOnSelect=true', () => {
        wrapper.setProps({ multiple: false, closeOnSelect: true })
        vm.openMenu()

        expect(vm.isOpen).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.isOpen).toBe(false)
      })
    })

    describe('when disableBranchNodes=true', () => {
      beforeEach(() => {
        wrapper.setProps({ disableBranchNodes: true })
      })

      it('a branch node should not have checkbox when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfBranchNode = getLabelWrapperOfBranchNode()

        expect(labelWrapperOfBranchNode.contains('.vue-treeselect__checkbox')).toBe(false)
      })

      it('a leaf node should have checkbox when multiple=true', () => {
        wrapper.setProps({ multiple: true })
        const labelWrapperOfLeafNode = getLabelWrapperOfLeafNode()

        expect(labelWrapperOfLeafNode.contains('.vue-treeselect__checkbox')).toBe(true)
      })

      it('click on label of a branch node should not toggle checking state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
        clickOnLabelOfBranchNode()
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
      })

      it('click on label of a branch node should toggle expanding state when multiple=true', () => {
        wrapper.setProps({ multiple: true })

        expect(vm.nodeMap.branch.isExpanded).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.nodeMap.branch.isExpanded).toBe(false)
        clickOnLabelOfBranchNode()
        expect(vm.nodeMap.branch.isExpanded).toBe(true)
      })

      it('click on label of a branch node should not close the dropdown when multiple=false & closeOnSelect=true', () => {
        wrapper.setProps({ multiple: false, closeOnSelect: true })
        vm.openMenu()

        expect(vm.isOpen).toBe(true)
        clickOnLabelOfBranchNode()
        expect(vm.isOpen).toBe(true)
      })

      it('should not auto-select ancestor nodes like flat-mode', () => {
        wrapper.setProps({ multiple: true })

        vm.select(vm.nodeMap.leaf)
        expect(vm.isSelected(vm.nodeMap.leaf)).toBe(true)
        expect(vm.isSelected(vm.nodeMap.branch)).toBe(false)
      })
    })
  })

  describe('disabled', () => {
    it('when disabled=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: true,
          disabled: false,
        },
      })

      expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
      expect(wrapper.contains('.vue-treeselect__input')).toBe(true)
    })

    describe('when disabled=true', () => {
      it('should hide the input but keep the input wrapper', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            searchable: true,
            disabled: true,
          },
        })

        expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
        expect(wrapper.contains('.vue-treeselect__input')).toBe(false)
      })

      it('should close the menu when setting disabled from false to true', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            disabled: false,
          },
        })

        wrapper.vm.openMenu()
        expect(wrapper.vm.isOpen).toBe(true)
        wrapper.setProps({ disabled: true })
        expect(wrapper.vm.isOpen).toBe(false)
      })

      it('the control should reject all clicks', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            disabled: true,
          },
        })
        const { vm } = wrapper
        const valueWrapper = wrapper.find('.vue-treeselect__value-wrapper')

        leftClick(valueWrapper)
        expect(vm.isFocused).toBe(false)
        expect(vm.isOpen).toBe(false)
      })

      it('the control should be non-focusable', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            disabled: true,
          },
        })
        const { vm } = wrapper

        wrapper.vm.focusInput()
        expect(vm.isFocused).toBe(false)
      })

      it('should be uanble to open the menu', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            disabled: true,
          },
        })
        const { vm } = wrapper

        wrapper.vm.openMenu()
        expect(vm.isOpen).toBe(false)
      })
    })
  })

  describe('disableFuzzyMatching', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'jamesblunt',
            label: 'James Blunt',
          } ],
        },
      })
      vm = wrapper.vm
    })

    it('when disableFuzzyMatching=false', async () => {
      wrapper.setProps({ disableFuzzyMatching: false })
      await typeSearchText(wrapper, 'jb')
      expect(vm.nodeMap.jamesblunt.isMatched).toBe(true)
    })

    it('when disableFuzzyMatching=true', async () => {
      wrapper.setProps({ disableFuzzyMatching: true })
      await typeSearchText(wrapper, 'jb')
      expect(vm.nodeMap.jamesblunt.isMatched).toBe(false)
    })
  })

  describe('limit', () => {
    it('when limit=Infinity', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          limit: Infinity,
          value: [ 'a', 'b', 'c', 'd' ],
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          }, {
            id: 'c',
            label: 'c',
          }, {
            id: 'd',
            label: 'd',
          } ],
        },
      })
      const { vm } = wrapper
      const { a, b, c, d } = vm.nodeMap

      expect(vm.selectedNodeIds).toEqual([ 'a', 'b', 'c', 'd' ])
      expect(vm.visibleValue).toEqual([ a, b, c, d ])
      expect(wrapper.findAll('.vue-treeselect__multi-value-item').length).toBe(4)
      expect(wrapper.contains('.vue-treeselect__limit-tip')).toBe(false)
    })

    it('when limit=1', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          limit: 1,
          value: [ 'a', 'b', 'c', 'd' ],
          options: [ {
            id: 'a',
            label: 'a',
          }, {
            id: 'b',
            label: 'b',
          }, {
            id: 'c',
            label: 'c',
          }, {
            id: 'd',
            label: 'd',
          } ],
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      expect(vm.selectedNodeIds).toEqual([ 'a', 'b', 'c', 'd' ])
      expect(vm.visibleValue).toEqual([ a ])
      expect(wrapper.findAll('.vue-treeselect__multi-value-item').length).toBe(1)
      expect(wrapper.contains('.vue-treeselect__limit-tip')).toBe(true)
      expect(wrapper.find('.vue-treeselect__limit-tip').text()).toBe('and 3 more')
    })
  })

  describe('loadChildrenOptions', () => {
    it('should call loadChildrenOptions() to load children options when expanding an unloaded branch node', async () => {
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        expect(parentNode).toBe(a.raw)
        expect(callback).toBeFunction()
        expect(a.isPending).toBe(true)
        expect(a.isLoaded).toBe(false)
        const children = [ {
          id: 'aa',
          label: 'aa',
        } ]
        callback(null, children)
        expect(a.isPending).toBe(false)
        expect(a.isLoaded).toBe(true)
        expect(a.children.map(child => child.raw)).toEqual(children)
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null, // declare an unloaded branch node
          } ],
          loadChildrenOptions,
        },
        data: {
          // it only auto loads children options when the option has been rendered to the DOM
          // so the menu must be open
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions).toHaveBeenCalled()
    })

    it('should accept empty results', async () => {
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        expect(a.isPending).toBe(true)
        expect(a.isLoaded).toBe(false)
        callback(null, [])
        expect(a.isPending).toBe(false)
        expect(a.isLoaded).toBe(true)
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions).toHaveBeenCalled()
    })

    it('should be able to handle loading error', async () => {
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        expect(a.isPending).toBe(true)
        expect(a.isLoaded).toBe(false)
        const error = new Error('$ERROR$')
        callback(error)
        expect(a.isPending).toBe(false)
        expect(a.isLoaded).toBe(false)
        expect(a.loadingChildrenError).toBe(`Failed to load children options: ${error.message}.`)
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions).toHaveBeenCalled()
    })

    it('should be able to recover from loading error', async () => {
      let c = 0
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions').and.callFake((parentNode, callback) => {
        if (c === 0) {
          const error = new Error('$ERROR$')
          callback(error)
          expect(a.loadingChildrenError).toBe(`Failed to load children options: ${error.message}.`)
        } else if (c === 1) {
          expect(a.isPending).toBe(true)
          expect(a.isLoaded).toBe(false)
          callback(null, [ {
            id: 'aa',
            label: 'aa',
          } ])
          expect(a.isPending).toBe(false)
          expect(a.isLoaded).toBe(true)
          expect(a.children).toBeNonEmptyArray()
          expect(a.loadingChildrenError).toBe('')
        } else {
          throw new Error('unknown error')
        }

        c++
      })
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      const { a } = vm.nodeMap

      // expand
      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions.calls.count()).toBe(1)

      // collapse
      vm.toggleExpanded(a)
      await vm.$nextTick()

      // expand again
      vm.toggleExpanded(a)
      await vm.$nextTick()
      expect(loadChildrenOptions.calls.count()).toBe(2)
    })

    it('should warn about the absent of `loadChildrenOptions` prop when unloaded branch nodes detected', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'id',
            label: 'label',
            children: null,
          } ],
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Unloaded branch node detected. `loadChildrenOptions` prop is required to load its children.',
      )
    })

    it('shoud error if received data is not an array', async () => {
      spyOn(console, 'error')

      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions(parentNode, callback) {
            callback(null, /* non-arry */ null)
          },
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.loadingChildrenError).toBe('Received unrecognizable data')
      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Received unrecognizable data null while loading children options of node a'
      )
    })

    it('should avoid of calling `loadChildrenOptions()` when an in-flight request is unfinished', async () => {
      jasmine.clock().install()

      const DELAY = 200
      const ERROR_MSG = '$ERROR_MSG$'
      const loadChildrenOptions = jasmine.createSpy('loadChildrenOptions', (parentNode, callback) => {
        setTimeout(() => callback(new Error(ERROR_MSG)), DELAY)
      }).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          loadChildrenOptions,
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      await vm.$nextTick()

      expect(loadChildrenOptions).not.toHaveBeenCalled()
      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        isExpanded: true,
        isPending: true,
      }))
      expect(loadChildrenOptions.calls.count()).toBe(1)

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isExpanded).toBe(false)

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isExpanded).toBe(true)
      expect(loadChildrenOptions.calls.count()).toBe(1)

      jasmine.clock().tick(DELAY + 1)
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        isExpanded: true,
        isPending: false,
        loadingChildrenError: `Failed to load children options: ${ERROR_MSG}.`,
      }))

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isExpanded).toBe(false)

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(loadChildrenOptions.calls.count()).toBe(2)
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        isExpanded: true,
        isPending: true,
      }))

      jasmine.clock().uninstall()
    })

    it('multiple instances share the same `loadChildrenOptions` function', async () => {
      const loadChildrenOptions = jasmine.createSpy('loadRootOptions')
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          id: 1,
          loadChildrenOptions,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: null,
          } ],
        },
        data: {
          isOpen: true,
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          id: 2,
          loadChildrenOptions,
          options: [ {
            id: 'branch',
            label: 'branch',
            children: null,
          } ],
        },
        data: {
          isOpen: true,
        },
      })

      vm1.toggleExpanded(vm1.nodeMap.branch)
      await vm1.$nextTick()
      expect(loadChildrenOptions.calls.argsFor(0)).toEqual([ jasmine.any(Object), jasmine.any(Function), 1 ])

      vm2.toggleExpanded(vm2.nodeMap.branch)
      await vm2.$nextTick()
      expect(loadChildrenOptions.calls.argsFor(1)).toEqual([ jasmine.any(Object), jasmine.any(Function), 2 ])
    })


    it('should override fallback nodes', async () => {
      jasmine.clock().install()

      const DELAY = 200
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          value: 'aa',
          loadChildrenOptions(parentNode, callback) {
            setTimeout(() => {
              callback(null, [ {
                id: 'aa',
                label: 'aa',
              }, {
                id: 'ab',
                label: 'ab',
              } ])
            }, DELAY)
          },
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper
      // eslint-disable-next-line newline-per-chained-call
      const getValueText = () => wrapper.find('.vue-treeselect__single-value').text().trim()

      expect(vm.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa (unknown)',
        isFallbackNode: true,
      }))
      expect(getValueText()).toBe('aa (unknown)')

      expect(vm.nodeMap.a.isLoaded).toBe(false)
      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isPending).toBe(true)

      jasmine.clock().tick(DELAY + 1)
      await vm.$nextTick()
      expect(vm.nodeMap.a.isLoaded).toBe(true)
      expect(vm.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa',
      }))
      expect(getValueText()).toBe('aa')

      jasmine.clock().uninstall()
    })

    it('after loading children options of a checked node, should also check these children options', async () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: null,
          } ],
          multiple: true,
          flat: false,
          valueFormat: 'id',
          valueConsistsOf: 'BRANCH_PRIORITY',
          loadChildrenOptions(parentNode, callback) {
            if (parentNode.id === 'a') {
              callback(null, [ {
                id: 'aa',
                label: 'aa',
                children: null,
              }, {
                id: 'ab',
                label: 'ab',
              } ])
            }

            if (parentNode.id === 'aa') {
              callback(null, [ {
                id: 'aaa',
                label: 'aaa',
              }, {
                id: 'aab',
                label: 'aab',
              } ])
            }
          },
        },
        data: {
          isOpen: true,
        },
      })
      const { vm } = wrapper

      vm.select(vm.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.nodeCheckedStateMap).toEqual({
        a: CHECKED,
      })

      vm.toggleExpanded(vm.nodeMap.a)
      await vm.$nextTick()
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.selectedNodeIds).toEqual([ 'a', 'aa', 'ab' ])
      expect(vm.nodeCheckedStateMap).toEqual({
        a: CHECKED,
        aa: CHECKED,
        ab: CHECKED,
      })

      vm.toggleExpanded(vm.nodeMap.aa)
      await vm.$nextTick()
      expect(vm.internalValue).toEqual([ 'a' ])
      expect(vm.selectedNodeIds).toEqual([ 'a', 'aa', 'ab', 'aaa', 'aab' ])
      expect(vm.nodeCheckedStateMap).toEqual({
        a: CHECKED,
        aa: CHECKED,
        ab: CHECKED,
        aaa: CHECKED,
        aab: CHECKED,
      })
    })
  })

  describe('loadRootOptions', () => {
    it('should call loadRootOptions() to load root options when opening the menu', () => {
      jasmine.clock().install()

      const DELAY = 100
      const loadRootOptions = jasmine.createSpy('loadRootOptions', callback => {
        const rootOptions = [ {
          id: 'a',
          label: 'a',
        } ]
        setTimeout(() => callback(null, rootOptions), DELAY)
      }).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          loadRootOptions,
        },
      })
      const { vm } = wrapper

      expect(vm.rootOptionsLoaded).toBe(false)
      vm.openMenu()
      expect(loadRootOptions).toHaveBeenCalled()
      expect(vm.loadingRootOptions).toBe(true)

      jasmine.clock().tick(DELAY + 1)
      expect(vm.rootOptionsLoaded).toBe(true)
      expect(vm.loadingRootOptions).toBe(false)
      expect(vm.normalizedOptions.length).toBe(1)
      expect(vm.nodeMap.a).toBeObject()

      jasmine.clock().uninstall()
    })

    it('should accept empty array & be able to handle loading error', () => {
      jasmine.clock().install()

      const DELAY = 100
      const ERROR_MSG = '$ERROR_MSG$'
      let called = false
      const loadRootOptions = jasmine.createSpy('loadRootOptions', callback => {
        if (called) {
          setTimeout(() => callback(null, []), DELAY)
        } else {
          called = true
          setTimeout(() => callback(new Error(ERROR_MSG)), DELAY)
        }
      }).and.callThrough()
      const wrapper = mount(Treeselect, {
        propsData: {
          loadRootOptions,
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      jasmine.clock().tick(DELAY + 1)
      expect(vm.loadingRootOptionsError).toBe(ERROR_MSG)

      vm.closeMenu()
      vm.openMenu()
      jasmine.clock().tick(DELAY + 1)
      expect(vm.loadingRootOptionsError).toBe('')
      expect(vm.rootOptionsLoaded).toBe(true)

      jasmine.clock().uninstall()
    })

    describe('should be able to handle invalid data', () => {
      let wrapper, vm, value, expectedError

      beforeEach(() => {
        wrapper = mount(Treeselect, {
          propsData: {
            loadRootOptions(callback) {
              callback(null, value)
            },
          },
        })
        vm = wrapper.vm
      })

      afterEach(() => {
        wrapper.vm.openMenu()
        expect(vm.loadingRootOptions).toBe(false)
        expect(vm.loadingRootOptionsError).toBe(expectedError)
        expect(vm.rootOptionsLoaded).toBe(false)
      })

      it('falsy value', () => {
        value = null
        expectedError = 'no data received'
      })

      it('non-array value', () => {
        value = {}
        expectedError = 'received unrecognizable data'
      })
    })

    it('should avoid calling `loadingRootOptions` when an in-flight request is incomplete', () => {
      const loadRootOptions = jasmine.createSpy('loadRootOptions')
      const wrapper = mount(Treeselect, {
        propsData: {
          loadRootOptions,
        },
      })
      const { vm } = wrapper

      vm.openMenu()
      expect(loadRootOptions.calls.count()).toBe(1)

      vm.closeMenu()
      vm.openMenu()
      expect(loadRootOptions.calls.count()).toBe(1)
    })

    it('multiple instances share the same `loadRootOptions` function', () => {
      const loadRootOptions = jasmine.createSpy('loadRootOptions')
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          id: 1,
          loadRootOptions,
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          id: 2,
          loadRootOptions,
        },
      })

      vm1.openMenu()
      expect(loadRootOptions.calls.argsFor(0)).toEqual([ jasmine.any(Function), 1 ])

      vm2.openMenu()
      expect(loadRootOptions.calls.argsFor(1)).toEqual([ jasmine.any(Function), 2 ])
    })

    it('should override fallback nodes', () => {
      // the same with `loadChildrenOptions`
    })
  })

  describe('normalizer', () => {
    it('customizing key names', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            key: 'a',
            name: 'a',
          } ],
          normalizer(node) {
            return {
              id: node.key,
              label: node.name,
            }
          },
        },
      })
      const { vm } = wrapper

      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
        raw: {
          key: 'a',
          name: 'a',
        },
      }))
    })

    it('with fallback node', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          value: {
            key: 'a',
            name: 'a',
          },
          options: [],
          valueFormat: 'object',
          normalizer(node) {
            return {
              id: node.key,
              label: node.name,
            }
          },
        },
      })
      const { vm } = wrapper

      expect(vm.selectedNodeIds).toEqual([ 'a' ])
      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
        isFallbackNode: true,
        raw: {
          key: 'a',
          name: 'a',
        },
      }))
    })

    it('multiple instances share the same `normalizer` function', () => {
      const normalizer = (node, id) => ({
        id: id + '-' + node.key,
        label: node.name,
      })
      const { vm: vm1 } = mount(Treeselect, {
        propsData: {
          id: 1,
          options: [ {
            key: 'a',
            name: 'a',
          } ],
          normalizer,
        },
      })
      const { vm: vm2 } = mount(Treeselect, {
        propsData: {
          id: 2,
          options: [ {
            key: 'a',
            name: 'a',
          } ],
          normalizer,
        },
      })

      expect(Object.keys(vm1.nodeMap)).toEqual([ '1-a' ])
      expect(Object.keys(vm2.nodeMap)).toEqual([ '2-a' ])
    })

    it('provide only the keys that need to be customized', () => {
      const normalizer = node => ({ id: node.key })
      const wrapper = mount(Treeselect, {
        propsData: {
          normalizer,
          options: [ {
            key: 'a',
            label: 'a',
            children: [ {
              key: 'aa',
              label: 'aa',
            } ],
          } ],
        },
      })
      const { vm } = wrapper

      expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
        id: 'a',
        label: 'a',
      }))
      expect(vm.nodeMap.aa).toEqual(jasmine.objectContaining({
        id: 'aa',
        label: 'aa',
      }))
    })
  })

  describe('openOnClick', () => {
    it('when openOnClick=false', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnClick: false,
        },
      })
      const { vm } = wrapper
      const valueWrapper = wrapper.find('.vue-treeselect__value-wrapper')

      expect(vm.isFocused).toBe(false)
      expect(vm.isOpen).toBe(false)

      leftClick(valueWrapper)
      expect(vm.isFocused).toBe(true)
      expect(vm.isOpen).toBe(false)

      leftClick(valueWrapper)
      expect(vm.isFocused).toBe(true)
      expect(vm.isOpen).toBe(true)
    })

    it('when openOnClick=true', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnClick: true,
        },
      })
      const { vm } = wrapper
      const valueWrapper = wrapper.find('.vue-treeselect__value-wrapper')

      expect(vm.isFocused).toBe(false)
      expect(vm.isOpen).toBe(false)

      leftClick(valueWrapper)
      expect(vm.isFocused).toBe(true)
      expect(vm.isOpen).toBe(true)
    })
  })

  describe('openOnFocus', () => {
    it('when openOnFocus=false', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnFocus: false,
        },
      })
      const { vm } = wrapper
      const valueWrapper = wrapper.find('.vue-treeselect__value-wrapper')

      expect(vm.isFocused).toBe(false)
      expect(vm.isOpen).toBe(false)

      wrapper.vm.focusInput()
      expect(vm.isFocused).toBe(true)
      expect(vm.isOpen).toBe(false)

      leftClick(valueWrapper)
      expect(vm.isFocused).toBe(true)
      expect(vm.isOpen).toBe(true)
    })

    it('when openOnFocus=true', () => {
      const wrapper = mount(Treeselect, {
        attachToDocument: true,
        propsData: {
          options: [],
          openOnFocus: true,
        },
      })
      const { vm } = wrapper

      expect(vm.isFocused).toBe(false)
      expect(vm.isOpen).toBe(false)

      wrapper.vm.focusInput()
      expect(vm.isFocused).toBe(true)
      expect(vm.isOpen).toBe(true)
    })

    describe('combined with autoFocus', () => {
      it('when openOnFocus=false', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            autoFocus: true,
            openOnFocus: false,
          },
        })
        const { vm } = wrapper

        expect(vm.isFocused).toBe(true)
        expect(vm.isOpen).toBe(false)
      })

      it('when openOnFocus=true', () => {
        const wrapper = mount(Treeselect, {
          attachToDocument: true,
          propsData: {
            options: [],
            autoFocus: true,
            openOnFocus: true,
          },
        })
        const { vm } = wrapper

        expect(vm.isFocused).toBe(true)
        expect(vm.isOpen).toBe(true)
      })
    })
  })

  describe('options', () => {
    it('should warn about being absent', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: null,
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Required prop `options` is not provided.'
      )
    })

    it('should warn about non-array prop value', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          options: {},
        },
      })

      expect(console.error).toHaveBeenCalledWith(
        '[Vue-Treeselect Warning]',
        'Expected prop `options` to be an array, instead got: [object Object].'
      )
    })

    it('can be omitted when `loadRootOptions` prop provided', () => {
      spyOn(console, 'error')

      mount(Treeselect, {
        propsData: {
          loadRootOptions() { /* empty */ },
        },
      })

      expect(console.error).not.toHaveBeenCalled()
    })

    it('show tip when `options` is an empty array', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
        },
        data: {
          isOpen: true,
        },
      })

      const menu = wrapper.find('.vue-treeselect__menu')
      const noOptionsTip = menu.find('.vue-treeselect__no-options-tip')
      expect(noOptionsTip.text().trim()).toBe('No options available.')
    })

    describe('should be reactive', () => {
      it('should override fallback node', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [],
            value: 'a', // this creates a fallback node
          },
        })
        const { vm } = wrapper

        expect(vm.nodeMap.a).toEqual(jasmine.objectContaining({
          isFallbackNode: true,
          label: 'a (unknown)',
        }))

        wrapper.setProps({
          options: [ {
            id: 'a',
            label: 'a',
          } ],
        })
        expect(vm.nodeMap.a.label).toBe('a')
      })

      it('directly modify `options` prop should trigger reinitializing', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            options: [ {
              id: 'a',
              label: 'a',
            } ],
          },
          template: `<div><treeselect :options="options" /></div>`,
        }).$mount()
        const comp = vm.$children[0]

        // note that, this is directly modifying the original `options` array,
        // not creating a new `options` array.
        vm.options[0].label = 'xxx'
        await vm.$nextTick()
        expect(comp.nodeMap.a.label).toBe('xxx')
      })

      it('should keep state', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            multiple: true,
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
              } ],
            } ],
            value: [ 'a' ],
          },
        })
        const { vm } = wrapper

        vm.toggleExpanded(vm.nodeMap.a)
        expect(vm.isSelected(vm.nodeMap.a)).toBe(true)
        expect(vm.nodeMap.a.isExpanded).toBe(true)
        expect(vm.nodeCheckedStateMap).toEqual({
          a: CHECKED,
          aa: CHECKED,
        })

        wrapper.setProps({
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            }, {
              // add new option
              id: 'ab',
              label: 'ab',
            } ],
          }, {
            // add new option
            id: 'b',
            label: 'b',
          } ],
        })
        expect(vm.isSelected(vm.nodeMap.a)).toBe(true)
        expect(vm.nodeMap.a.isExpanded).toBe(true)
        expect(vm.nodeCheckedStateMap).toEqual({
          a: CHECKED,
          aa: CHECKED,
          ab: CHECKED,
          b: UNCHECKED,
        })
      })

      it('should keep the state of selected nodes even if they are not present in `nodeMap`', () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            options: [ {
              id: 'a',
              label: 'a',
            } ],
            value: 'a',
          },
        })
        const { vm } = wrapper

        expect(vm.nodeMap.a.label).toBe('a')

        wrapper.setProps({
          options: [ {
            id: 'b',
            label: 'b',
            children: [],
          } ],
        })

        expect(vm.nodeMap.a.label).toBe('a')
        expect(vm.nodeMap.a.isFallbackNode).toBe(true)
      })
    })
  })

  describe('required', () => {
    let wrapper, inputWrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
          } ],
          searchable: true,
        },
      })
      inputWrapper = findInput(wrapper)
    })

    describe('when required=true', () => {
      it('the input should have `required` attribute if having no value', () => {
        wrapper.setProps({ required: true })
        expect(inputWrapper.attributes().required).toBe('required')
      })

      it('the input should not have `required` attribute if value is present', () => {
        wrapper.setProps({ value: 'a', required: true })
        expect(inputWrapper.attributes()).not.toHaveMember('required')
      })
    })

    describe('when required=false', () => {
      it('the input should not have `required` attribute even if value is present', () => {
        wrapper.setProps({ value: 'a', required: false })
        expect(inputWrapper.attributes()).not.toHaveMember('required')
      })
    })
  })

  describe('retainScrollPosition', () => {
    const step = 20

    async function test(value, callback) {
      const maxHeight = 100
      const wrapper = mount(Treeselect, {
        propsData: {
          options: generateOptions(3),
          defaultExpandLevel: Infinity,
          retainScrollPosition: value,
          maxHeight,
        },
        attachToDocument: true,
      })
      const { vm } = wrapper

      for (let i = 0; i < 3; i++) {
        vm.openMenu()
        await vm.$nextTick()
        const menu = findMenu(wrapper)
        expect(menu.element.scrollHeight).toBeGreaterThan(maxHeight)
        callback(menu)
        menu.element.scrollBy(0, step)
        vm.closeMenu()
        await vm.$nextTick()
      }
    }

    it('when retainScrollPosition=false', async () => {
      await test(false, menu => {
        expect(menu.element.scrollTop).toBe(0)
      })
    })

    it('when retainScrollPosition=true', async () => {
      let pos = 0
      await test(true, menu => {
        expect(menu.element.scrollTop).toBe(pos)
        pos += step
      })
    })
  })

  describe('searchable', () => {
    describe('when searchable=true', () => {
      describe('when multiple=true', () => {
        it('should show input', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: true,
              searchable: true,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-wrapper .vue-treeselect__input')).toBe(true)
        })

        it('should auto resize when length of input value changes', () => {
          // This is currently impossible since both PhantomJS and Headless Chrome
          // always return 0 for `clientWidth`, `offsetWidth` and etc.
        })
      })

      describe('when multiple=false', () => {
        it('should show input', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: false,
              searchable: true,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-wrapper .vue-treeselect__input')).toBe(true)
        })
      })

      it('entering search query', async () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            searchable: true,
            options: [],
          },
        })
        const { vm } = wrapper

        expect(vm.searching).toBe(false)
        expect(vm.searchQuery).toBe('')

        await typeSearchText(wrapper, '$SEARCH_QUERY$')
        expect(vm.searching).toBe(true)
        expect(vm.searchQuery).toBe('$SEARCH_QUERY$')

        await typeSearchText(wrapper, '')
        expect(vm.searching).toBe(false)
        expect(vm.searchQuery).toBe('')
      })

      it('filtering', async () => {
        const wrapper = mount(Treeselect, {
          propsData: {
            multiple: true,
            searchable: true,
            options: [ {
              id: 'a',
              label: 'a',
              children: [ {
                id: 'aa',
                label: 'aa',
              }, {
                id: 'ab',
                label: 'ab',
              } ],
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          data: {
            isOpen: true,
          },
        })
        const { vm } = wrapper

        expect(vm.noSearchResults).toBe(true)

        await typeSearchText(wrapper, 'b')
        expect(vm.noSearchResults).toBe(false)

        const expectedMatchedNodeIds = [ 'ab', 'b' ]
        const optionWrappers = wrapper.findAll(TreeselectOption)
        expect(optionWrappers.length).toBe(4)
        optionWrappers.wrappers.forEach(optionWrapper => {
          const { node } = optionWrapper.vm
          expect(node.isMatched).toBe(expectedMatchedNodeIds.indexOf(node.id) !== -1)
        })
      })
    })

    describe('when searchable=false', () => {
      describe('when multiple=true', () => {
        it('should not show input but a placeholder', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: true,
              searchable: false,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
          expect(wrapper.find('.vue-treeselect__input-wrapper').isEmpty()).toBe(true)
        })
      })

      describe('when multiple=false', () => {
        it('should not show input but a placeholder', () => {
          const wrapper = mount(Treeselect, {
            propsData: {
              multiple: false,
              searchable: false,
              options: [],
            },
          })

          expect(wrapper.contains('.vue-treeselect__input-wrapper')).toBe(true)
          expect(wrapper.find('.vue-treeselect__input-wrapper').isEmpty()).toBe(true)
        })
      })
    })
  })

  it('showCount', () => {
    // TODO
  })

  describe('showCountOnSearch', () => {
    let wrapper

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
            }, {
              id: 'ab',
              label: 'ab',
            } ],
          }, {
            id: 'b',
            label: 'b',
            children: [ {
              id: 'ba',
              label: 'ba',
            }, {
              id: 'bb',
              label: 'bb',
            } ],
          } ],
          showCount: true,
        },
        data: {
          isOpen: true,
        },
      })
    })

    it('when showCountOnSearch=false', async () => {
      wrapper.setProps({ showCountOnSearch: false })

      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(false)
    })

    it('when showCountOnSearch=true', async () => {
      wrapper.setProps({ showCountOnSearch: true })

      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(true)
    })

    it('when showCountOnSearch not specified', async () => {
      await typeSearchText(wrapper, 'a')
      expect(wrapper.contains('.vue-treeselect__count')).toBe(true)
    })

    it('should refresh count number after search changes', async () => {
      wrapper.setProps({ showCountOnSearch: true })

      await typeSearchText(wrapper, 'a')
      expect(findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__count').text()).toEqual('(2)')
      expect(findOptionByNodeId(wrapper, 'b').find('.vue-treeselect__count').text()).toEqual('(1)')

      await typeSearchText(wrapper, 'b')
      expect(findOptionByNodeId(wrapper, 'a').find('.vue-treeselect__count').text()).toEqual('(1)')
      expect(findOptionByNodeId(wrapper, 'b').find('.vue-treeselect__count').text()).toEqual('(2)')
    })
  })

  describe('sortValueBy', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          options: generateOptions(4),
          multiple: true,
          flat: true,
        },
      })
      vm = wrapper.vm
    })

    it('when sortValueBy="ORDER_SELECTED"', () => {
      wrapper.setProps({ sortValueBy: 'ORDER_SELECTED' })

      vm.select(vm.nodeMap.bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(vm.nodeMap.a)
      expect(vm.internalValue).toEqual([ 'bb', 'a' ])
      vm.select(vm.nodeMap.dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd' ])
      vm.select(vm.nodeMap.ccc)
      expect(vm.internalValue).toEqual([ 'bb', 'a', 'dddd', 'ccc' ])
    })

    it('when sortValueBy="LEVEL"', () => {
      wrapper.setProps({ sortValueBy: 'LEVEL' })

      vm.select(vm.nodeMap.bb)
      expect(vm.internalValue).toEqual([ 'bb' ])
      vm.select(vm.nodeMap.aaa)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa' ])
      vm.select(vm.nodeMap.dddd)
      expect(vm.internalValue).toEqual([ 'bb', 'aaa', 'dddd' ])
      vm.select(vm.nodeMap.c)
      expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa', 'dddd' ])
      vm.select(vm.nodeMap.aa)
      expect(vm.internalValue).toEqual([ 'c', 'aa', 'bb', 'aaa', 'dddd' ])
    })

    it('when sortValueBy="INDEX"', () => {
      wrapper.setProps({ sortValueBy: 'INDEX' })

      vm.select(vm.nodeMap.d)
      expect(vm.internalValue).toEqual([ 'd' ])
      vm.select(vm.nodeMap.bbb)
      expect(vm.internalValue).toEqual([ 'bbb', 'd' ])
      vm.select(vm.nodeMap.aaaa)
      expect(vm.internalValue).toEqual([ 'aaaa', 'bbb', 'd' ])
      vm.select(vm.nodeMap.cc)
      expect(vm.internalValue).toEqual([ 'aaaa', 'bbb', 'cc', 'd' ])
    })

    it('should re-sort value after prop value changes', () => {
      wrapper.setProps({
        sortValueBy: 'ORDER_SELECTED',
        value: [ 'bb', 'c', 'aaa' ],
      })

      wrapper.setProps({ sortValueBy: 'INDEX' })
      expect(vm.internalValue).toEqual([ 'aaa', 'bb', 'c' ])
      wrapper.setProps({ sortValueBy: 'LEVEL' })
      expect(vm.internalValue).toEqual([ 'c', 'bb', 'aaa' ])
      wrapper.setProps({ sortValueBy: 'ORDER_SELECTED' })
      expect(vm.internalValue).toEqual([ 'bb', 'c', 'aaa' ])
    })
  })

  describe('tabIndex', () => {
    it('when disabled=false & searchable=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: true,
          disabled: false,
        },
      })

      const $inputWrapper = wrapper.find('.vue-treeselect__input-wrapper')
      const $input = wrapper.find('.vue-treeselect__input')
      expect($inputWrapper.attributes().tabindex).toBe(undefined)
      expect($input.attributes().tabindex).toBe('0')
    })

    it('when disabled=false & searchable=false', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: false,
          disabled: false,
        },
      })

      const $inputWrapper = wrapper.find('.vue-treeselect__input-wrapper')
      expect($inputWrapper.attributes().tabindex).toBe('0')
    })

    it('when disabled=true', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          disabled: true,
        },
      })

      const $inputWrapper = wrapper.find('.vue-treeselect__input-wrapper')
      expect($inputWrapper.attributes().tabindex).toBe(undefined)
    })

    it('customized value', () => {
      const wrapper = mount(Treeselect, {
        propsData: {
          options: [],
          searchable: true,
          disabled: false,
          tabIndex: 1,
        },
      })
      const inputWrapper = findInput(wrapper)

      expect(inputWrapper.attributes().tabindex).toBe('1')
    })
  })

  describe('valueConsistsOf', () => {
    let wrapper, vm

    beforeEach(() => {
      wrapper = mount(Treeselect, {
        propsData: {
          multiple: true,
          options: [ {
            id: 'a',
            label: 'a',
            children: [ {
              id: 'aa',
              label: 'aa',
              children: [ {
                id: 'aaa',
                label: 'aaa',
              }, {
                id: 'aab',
                label: 'aab',
              } ],
            }, {
              id: 'ab',
              label: 'ab',
              children: [ {
                id: 'aba',
                label: 'aba',
              }, {
                id: 'abb',
                label: 'abb',
              } ],
            }, {
              id: 'ac',
              label: 'ac',
            } ],
          }, {
            id: 'b',
            label: 'b',
            children: [],
          } ],
          value: [ 'aa' ],
        },
      })
      vm = wrapper.vm
    })

    it('when valueConsistsOf=ALL', () => {
      wrapper.setProps({ valueConsistsOf: 'ALL' })

      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab' ])
      vm.select(vm.nodeMap.ab)
      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb' ])
      vm.select(vm.nodeMap.b)
      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'b' ])
      vm.select(vm.nodeMap.ac)
      expect(vm.internalValue).toEqual([ 'aa', 'aaa', 'aab', 'ab', 'aba', 'abb', 'b', 'ac', 'a' ])
    })

    it('when valueConsistsOf=BRANCH_PRIORITY', () => {
      wrapper.setProps({ valueConsistsOf: 'BRANCH_PRIORITY' })

      expect(vm.internalValue).toEqual([ 'aa' ])
      vm.select(vm.nodeMap.ab)
      expect(vm.internalValue).toEqual([ 'aa', 'ab' ])
      vm.select(vm.nodeMap.b)
      expect(vm.internalValue).toEqual([ 'aa', 'ab', 'b' ])
      vm.select(vm.nodeMap.ac)
      expect(vm.internalValue).toEqual([ 'b', 'a' ])
    })

    it('when valueConsistsOf=LEAF_PRIORITY', () => {
      wrapper.setProps({ valueConsistsOf: 'LEAF_PRIORITY' })

      expect(vm.internalValue).toEqual([ 'aaa', 'aab' ])
      vm.select(vm.nodeMap.ab)
      expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb' ])
      vm.select(vm.nodeMap.b)
      expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb', 'b' ])
      vm.select(vm.nodeMap.ac)
      expect(vm.internalValue).toEqual([ 'aaa', 'aab', 'aba', 'abb', 'b', 'ac' ])
    })
  })

  describe('valueFormat', () => {
    describe('when valueFormat=id', () => {
      it('single-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: 'a',
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="id"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'b' ])
        expect(vm.value).toEqual('b')
      })

      it('multi-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: [ 'a' ],
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                :multiple="true"
                value-format="id"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'a', 'b' ])
        expect(vm.value).toEqual([ 'a', 'b' ])
      })
    })

    describe('when valueFormat=object', () => {
      it('single-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: {
              id: 'a',
              label: 'a',
            },
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="object"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'b' ])
        expect(vm.value).toEqual({
          id: 'b',
          label: 'b',
        })
      })

      it('multi-select', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: [ {
              id: 'a',
              label: 'a',
            } ],
            options: [ {
              id: 'a',
              label: 'a',
            }, {
              id: 'b',
              label: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                :multiple="true"
                value-format="object"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(comp.selectedNodeIds).toEqual([ 'a', 'b' ])
        expect(vm.value).toEqual([ {
          id: 'a',
          label: 'a',
        }, {
          id: 'b',
          label: 'b',
        } ])
      })

      it('should return raw node object', async () => {
        const vm = new Vue({
          components: { Treeselect },
          data: {
            value: {
              id: 'a',
              label: 'a',
            },
            options: [ {
              id: 'a',
              label: 'a',
              _extra: 'a',
            }, {
              id: 'b',
              label: 'b',
              _extra: 'b',
            } ],
          },
          template: `
            <div>
              <treeselect
                v-model="value"
                :options="options"
                value-format="object"
              />
            </div>
          `,
        }).$mount()
        const comp = vm.$children[0]

        expect(comp.selectedNodeIds).toEqual([ 'a' ])

        comp.select(comp.nodeMap.b)
        await comp.$nextTick()
        expect(vm.value).toEqual({
          id: 'b',
          label: 'b',
          _extra: 'b',
        })
      })
    })
  })
})
