import React, { Component } from "react";
import Pagination from "./Pagination";
import VPContainer from "../VPContainer";

export default function withPagination(WrappedComponent) {
    class WithPagination extends Component {
        constructor(props) {
            super(props);

            this.state = {
                currentPage: 0,
                numberOfItems: 1,
            };
        }

        nextPage = () => {
            this.setState((prevState) => {
                return { currentPage: prevState.currentPage + 1 };
            });
        }

        prevPage = () => {
            this.setState((prevState) => {
                return { currentPage: prevState.currentPage - 1 };
            });
        }
        
        setCurrentPage = currentPage => {
            this.setState({ currentPage });
        }

        setNumberOfItems = numberOfItems => {
            this.setState({ numberOfItems: numberOfItems === 0 ? 1 : numberOfItems });
        }

        showCurrentPage = (array, callback) => {
            const { itemsPerPage } = this.props;
            const { currentPage } = this.state;

            if (array === null) {
                return null;
            }

            const begin = currentPage * itemsPerPage;
            const end = begin + itemsPerPage;

            const page = [];

            for (let i = begin; i < array.length && i < end; ++i) {
                page.push(callback(array[i], i));
            }

            return page;
        }

        render() {
            const { itemsPerPage, loading, ...restProps } = this.props;
            const { numberOfItems, currentPage } = this.state;

            return (
                <VPContainer className="container mt-2">
                    {/* {   loading && <Spinner className="mt-5" /> } */}
                    {/* <div className={`${loading ? "d-none" : "d-block"}`}> */}
                    <WrappedComponent
                        {...restProps}
                        loading={loading}
                        setNumberOfItems={this.setNumberOfItems}
                        showCurrentPage={this.showCurrentPage}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                    />
                    {!loading && <Pagination
                        numberOfItems={numberOfItems}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        setCurrentPage={this.setCurrentPage}
                        nextPage={this.nextPage}
                        prevPage={this.prevPage}
                    />}
                    {/* </div> */}
                </VPContainer>
            );
        }
    }

    return WithPagination;
}