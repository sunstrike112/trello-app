import React, { useState, useEffect, useRef } from 'react'
import { isEmpty, cloneDeep } from 'lodash'
import { Container, Draggable } from 'react-smooth-dnd'
import { Container as BootstrapContainer, Row, Col, Form, Button } from 'react-bootstrap'

import { mapOrder } from 'utilities/sorts'
import { applyDrag } from 'utilities/dragDrop'
import {
  fetchBoarchDetails,
  createNewColumn,
  updateBoard,
  updateColumn,
  updateCard
} from 'actions/ApiCall'

import Column from 'components/Column/Column'
import './BoardContent.scss'

function BoardContent(props) {
  const [board, setBoard] = useState({})
  const [columns, setColumns] = useState([])
  const [openNewColumnForm, setOpenNewColumnForm] = useState(false)
  const toggleOpenNewColumnForm = () => {
    setOpenNewColumnForm(!openNewColumnForm)
  }
  const [newColumnTitle, setNewColunmTile] = useState('')

  const newColumInputRef = useRef(null)
  const onNewColumnTitleChange = (e) => setNewColunmTile(e.target.value)

  useEffect(() => {
    const boardId = '61578055ce183abd7c7e2dd1'
    fetchBoarchDetails(boardId).then(board => {
      setBoard(board)
      setColumns(mapOrder(board.columns, board.columnOrder, '_id'))
    })
  }, [])

  useEffect(() => {
    if (newColumInputRef && newColumInputRef.current) {
      newColumInputRef.current.focus()
      newColumInputRef.current.select()
    }
  }, [openNewColumnForm])

  if (isEmpty(board)) {
    return (
      <div className="not-found" style={{ padding: '10px', color: 'white' }}>
        Board not found
      </div>
    )
  }

  const onColumnDrop = (dropResult) => {
    let newColumns = cloneDeep(columns)
    newColumns = applyDrag(newColumns, dropResult)

    let newBoard = cloneDeep(board)
    newBoard.columnOrder = newColumns.map((column) => column._id)
    newBoard.columns = newColumns

    setColumns(newColumns)
    setBoard(newBoard)

    //Call API update columnOrder in board details
    updateBoard(newBoard._id, newBoard).catch(() => {
      setColumns(columns)
      setBoard(newBoard)
    })
  }

  const onCardDrop = (columnId, dropResult) => {
    if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
      let newColumns = cloneDeep(columns)
      let currentColumn = newColumns.find((column) => column._id === columnId)
      currentColumn.cards = applyDrag(currentColumn.cards, dropResult)
      currentColumn.cardOrder = currentColumn.cards.map((card) => card._id)

      if (dropResult.removedIndex !== null && dropResult.addedIndex !== null) {
        /**
         * Action: move card inside it's column
         * 1 - Call api update cardOrder in current column
         * 
         *  */
        updateColumn(currentColumn._id, currentColumn).catch(() => {
          setColumns(newColumns)
        })
      } else {
        /** 
         * Action: move card between two column
         * 1 - Call api update cardOrder in current column
         * 
         * */
        updateColumn(currentColumn._id, currentColumn).catch(() => {
          setColumns(newColumns)
        })

        if (dropResult.addedIndex !== null) {
          let currentCard = cloneDeep(dropResult.payload)
          currentCard.columnId = currentColumn._id
          // 2 - Call api update columnId in current card
          updateCard(currentCard._id, currentCard)
        }
      }

      setColumns(newColumns)
    }
  }

  const addNewColumn = () => {
    if (!newColumnTitle) {
      newColumInputRef.current.focus()
      return
    }

    const newColumnToAdd = {
      boardId: board._id,
      title: newColumnTitle.trim(),
    }

    //Call API create newColumn
    createNewColumn(newColumnToAdd).then(column => {
      let newColumns = [...columns]
      newColumns.push(column)

      let newBoard = { ...board }
      newBoard.columnOrder = newColumns.map((column) => column._id)
      newBoard.columns = newColumns
      setColumns(newColumns)
      setBoard(newBoard)
      setNewColunmTile('')
      toggleOpenNewColumnForm()
    })
  }

  const onUpdateColumState = (newColummToUpdate) => {
    const columnIdToUpdate = newColummToUpdate._id
    let newColumns = [...columns]
    const columnIndexToUpdate = newColumns.findIndex(
      (column) => column._id === columnIdToUpdate
    )

    if (newColummToUpdate._destroy) {
      newColumns.splice(columnIndexToUpdate, 1)
    } else {
      newColumns.splice(columnIndexToUpdate, 1, newColummToUpdate)
    }

    let newBoard = { ...board }
    newBoard.columnOrder = newColumns.map((column) => column._id)
    newBoard.columns = newColumns
    setColumns(newColumns)
    setBoard(newBoard)
  }

  return (
    <div className="board-content">
      <Container
        orientation="horizontal"
        onDrop={onColumnDrop}
        getChildPayload={(index) => columns[index]}
        dragHandleSelector=".column-drag-handle"
        dropPlaceholder={{
          animationDuration: 150,
          showOnTop: true,
          className: 'column-drop-preview',
        }}
      >
        {columns.map((column, index) => (
          <Draggable key={index}>
            <Column
              key={index}
              column={column}
              onCardDrop={onCardDrop}
              onUpdateColumState={onUpdateColumState}
            />
          </Draggable>
        ))}
      </Container>
      <BootstrapContainer className="trello-container">
        {!openNewColumnForm && (
          <Row>
            <Col className="add-new-column" onClick={toggleOpenNewColumnForm}>
              <i className="fa fa-plus icon" /> Add another column
            </Col>
          </Row>
        )}
        {openNewColumnForm && (
          <Row>
            <Col className="enter-new-column">
              <Form.Control
                size="sm"
                type="text"
                placeholder="Enter column title ..."
                className="input-enter-new-column"
                ref={newColumInputRef}
                value={newColumnTitle}
                onChange={onNewColumnTitleChange}
                onKeyDown={(event) => event.key === 'Enter' && addNewColumn()}
              />
              <Button variant="success" size="sm" onClick={addNewColumn}>
                Add column
              </Button>
              <span className="cancel-icon" onClick={toggleOpenNewColumnForm}>
                <i className="fa fa-trash icon" />
              </span>
            </Col>
          </Row>
        )}
      </BootstrapContainer>
    </div>
  )
}

export default BoardContent
