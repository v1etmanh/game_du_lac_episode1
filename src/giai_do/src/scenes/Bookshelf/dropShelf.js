import React from 'react';
import { DropTarget } from 'react-drag-drop-container';


 class Shelf extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          message: '',
          howManyBooks: 0,
          solved: false};

    }

    // logic for dropping the correct book on the shelf
    
    dropped = (e) => {
        e.containerElem.style.visibility="hidden";

        const howManyBooks = this.state.howManyBooks + 1;
        this.setState({ howManyBooks })
 
        const Swal = require("sweetalert2");

        // if both correct books dropped, then puzzle won
        if(howManyBooks >= 2 && !this.state.solved)
        {
            this.setState({ solved: true });
            this.props.handleSolvedPuzzle('1')
            Swal.fire("Answer: Day and Night\nYou found a key in one of the books!")
        }
    };

    render() {
        return (
        <DropTarget 
            onHit={this.dropped}
            targetKey={this.props.targetKey}
            dropData={{name: this.props.name}}    
        >

            <div className='bookshelfPuzzle'>
                {this.props.children}
                </div>
            
        </DropTarget>
        );
    }
}
export default Shelf;
