import React, { Component } from 'react'
import Accordion from '../../accordion/Accordion'
import AccordionItem from '../../accordion/AccordionItem'

class MessageBar extends Component {
    render() {
        const { children } = this.props;

        return (
            <div className="chat-bar">
                <h6 className="mb-0 py-2 text-center bg-secondary text-light" >Direct messages</h6>
                <Accordion>
                    <AccordionItem title="Message Tabs">
                        { children }
                    </AccordionItem>
                </Accordion>
            </div>
        );
    }
}

export default MessageBar;
