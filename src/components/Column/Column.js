import React, { useState, useEffect, useRef } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { Dropdown, Form, Button } from 'react-bootstrap'
import { cloneDeep } from 'lodash'

import Card from 'components/Card/Card'
import ConfirmModal from 'components/Common/ConfirmModal'
import './Column.scss'
import { mapOrder } from 'utilities/sorts'
import { MODAL_ACTION_CONFIRM } from 'utilities/constants'
import { selectAllInlineText, saveContentAfterPressEnter } from 'utilities/contentEdiable'
import { createNewCard, updateColumn } from 'actions/ApiCall'

function Column(props) {
  const { column, onCardDrop, onUpdateColumState } = props
  const cards = mapOrder(column.cards, column.cardOrder, '_id')
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [columnTitle, setColumnTitle] = useState('')
  const handleColumnTitleChange = (e) => setColumnTitle(e.target.value)
  const [openNewCardForm, setOpenNewCardForm] = useState(false)
  const toggleOpenNewCardForm = () => {
    setOpenNewCardForm(!openNewCardForm)
  }

  const toggleShowConfirmModal = () => {
    setShowConfirmModal(!showConfirmModal)
  }

  const newCardTextareaRef = useRef(null)

  const [newCardTitle, setNewCardTitle] = useState('')
  const onNewCardTitleChange = (e) => setNewCardTitle(e.target.value)

  useEffect(() => {
    setColumnTitle(column.title)
  }, [column.title])

  useEffect(() => {
    if (newCardTextareaRef && newCardTextareaRef.current) {
      newCardTextareaRef.current.focus()
      newCardTextareaRef.current.select()
    }
  }, [openNewCardForm])

  // Remove column
  const onConfirmModalAction = (type) => {
    if (type === MODAL_ACTION_CONFIRM) {
      const newColumn = {
        ...column,
        _destroy: true,
      }
      // Call API removeColumn
      updateColumn(newColumn._id, newColumn).then(updatedColumn => {
        onUpdateColumState(updatedColumn)
      })
      onUpdateColumState(newColumn)
    }
    toggleShowConfirmModal()
  }

  // Update column title
  const handleColumnTitleBlur = () => {
    if (columnTitle !== column.title) {
      const newColumn = {
        ...column,
        title: columnTitle,
      }
      // Call API updateColumn
      updateColumn(newColumn._id, newColumn).then(updatedColumn => {
        updatedColumn.cards = newColumn.cards
        onUpdateColumState(updatedColumn)
      })
    }
  }

  const addNewCard = () => {
    if (!newCardTitle) {
      newCardTextareaRef.current.focus()
      return
    }
    const newCardToAdd = {
      boardId: column.boardId,
      columnId: column._id,
      title: newCardTitle.trim(),
    }

    // Call API create newCard
    createNewCard(newCardToAdd).then(card => {
      let newColumn = cloneDeep(column)
      newColumn.cards.push(card)
      newColumn.cardOrder.push(card._id)

      onUpdateColumState(newColumn)
      setNewCardTitle('')
      toggleOpenNewCardForm()
    })
  }

  return (
    <div className="column">
      <header className="column-drag-handle">
        <div className="column-title">
          <Form.Control
            size="sm"
            type="text"
            className="trello-content-editable"
            value={columnTitle}
            spellCheck="false"
            onClick={selectAllInlineText}
            onChange={handleColumnTitleChange}
            onBlur={handleColumnTitleBlur}
            onKeyDown={saveContentAfterPressEnter}
            onMouseDown={(e) => e.preventDefault()}
          />
        </div>

        <div className="column-dropdown-actions">
          <Dropdown>
            <Dropdown.Toggle
              variant="success"
              id="dropdown-basic"
              size="sm"
              className="dropdown-btn"
            />

            <Dropdown.Menu>
              <Dropdown.Item onClick={toggleOpenNewCardForm}>Add card...</Dropdown.Item>
              <Dropdown.Item onClick={toggleShowConfirmModal}>
                Remove column...
              </Dropdown.Item>
              <Dropdown.Item>Move all card in this column</Dropdown.Item>
              <Dropdown.Item>Archive all card in this column</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </header>
      <div className="card-list">
        <Container
          orientation="vertical"
          groupName="trello-columns"
          onDrop={(dropResult) => onCardDrop(column._id, dropResult)}
          getChildPayload={(index) => cards[index]}
          dragClass="card-ghost"
          dropClass="card-ghost-drop"
          dropPlaceholder={{
            animationDuration: 150,
            showOnTop: true,
            className: 'card-drop-preview',
          }}
          dropPlaceholderAnimationDuration={200}
        >
          {cards.map((card, index) => (
            <Draggable key={index}>
              <Card card={card} />
            </Draggable>
          ))}
        </Container>
        {openNewCardForm && (
          <div className="add-new-card-area">
            <Form.Control
              size="sm"
              as="textarea"
              rows="3"
              placeholder="Enter a title of this card ..."
              className="textarea-enter-new-card"
              ref={newCardTextareaRef}
              value={newCardTitle}
              onChange={onNewCardTitleChange}
              onKeyDown={(event) => event.key === 'Enter' && addNewCard()}
            />
          </div>
        )}
      </div>
      <footer>
        {openNewCardForm && (
          <div className="add-new-card-actions">
            <Button variant="success" size="sm" onClick={addNewCard}>
              Add card
            </Button>
            <span className="cancel-icon">
              <i className="fa fa-trash icon" onClick={toggleOpenNewCardForm} />
            </span>
          </div>
        )}
        {!openNewCardForm && (
          <div className="footer-actions" onClick={toggleOpenNewCardForm}>
            <i className="fa fa-plus icon" /> Add another card
          </div>
        )}
      </footer>
      <ConfirmModal
        show={showConfirmModal}
        onAction={onConfirmModalAction}
        title="Remove column"
        content={`Are you sure want to remove <b>${column.title}</b>.<br />All related cards will be removed!`}
      />
    </div>
  )
}

export default Column
