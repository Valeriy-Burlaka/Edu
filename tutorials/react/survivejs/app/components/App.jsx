import uuid from 'uuid';

import React from 'react';
import Notes from './Notes';


export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      notes: [
        {
          id: uuid.v4(),
          task: 'Learn React'
        },
        {
          id: uuid.v4(),
          task: 'Do laundry'
        }
      ]
    };
  }
  render() {
    const notes = this.state.notes;

    return (
      <div>
        <button onClick={ this.addNote }>+</button>
        <Notes notes={notes} onDelete={this.deleteNote}/>
      </div>
    );
  }

  addNote = () => {
    this.setState({
      notes: this.state.notes.concat([
        {id: uuid.v4(), task: 'New Task'}
      ])
    });
  }

  deleteNote = (id, e) => {
    e.stopPropagation();

    this.setState({
      notes: this.state.notes.filter(note => note.id !== id)
    });
  }
}
