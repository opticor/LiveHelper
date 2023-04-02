import React from "react"

let curDragIndex: number = -1

function arrMove(arr:Array<never>, fromIndex:number, toIndex:number) {
  arr = [].concat(arr)
  let item = arr.splice(fromIndex, 1)[0]
  arr.splice(toIndex, 0, item)
  return arr
}

export default function DragSort(props: any) {
  let container = props.children;

  const onChange = (from: number, to: number)=> {
    if (from === to) return
    let curValue = props.data
    let newValue = arrMove(curValue, from, to)
    if (typeof props.onChange === "function") {
      return props.onChange(newValue, from, to)
    }
  }

  return (
    <div>
      {container.map((item:any, index: number) => {
        return React.cloneElement(item, {
          draggable: "true",
          onDragStart: function () {
            curDragIndex = index
          },
          onDragEnter: function () {
            onChange(curDragIndex, index);
            curDragIndex = index
          },
          onDragEnd: function () {
            curDragIndex = -1
            if (typeof props.onDragEnd === "function") {
              props.onDragEnd()
            }
          },
        })
      })}
    </div>
  )
}

