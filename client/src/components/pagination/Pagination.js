import React, { Component } from "react";
import PaginationLink from "./PaginationLink";
import PlaceHolderLink from "./PlaceholderLink";
import PageLink from "./PageLink";

export default class Pagination extends Component {
    generateLinks() {
        const {
            numberOfItems,
            itemsPerPage,
            currentPage,
            setCurrentPage
        } = this.props;

        const numberOfLinks = Math.ceil(numberOfItems / itemsPerPage);

        const MINIMUM_LINKS = 11;
        if (numberOfLinks < MINIMUM_LINKS) {
            return this.createArrayOfLinks(0, numberOfLinks);
        }

        const lastPage = numberOfLinks - 1;

        const LOWER_BOUNDARY = 6;
        if (currentPage < LOWER_BOUNDARY) {
            const links = this.createArrayOfLinks(0, LOWER_BOUNDARY + 1);
            links.push(<PlaceHolderLink />);
            links.push(
                <PaginationLink
                    key={lastPage}
                    setCurrentPage={setCurrentPage}
                    nth={lastPage}
                />
            );
            return links;
        }

        const UPPER_BOUNDARY = numberOfLinks - 7;
        if (currentPage > UPPER_BOUNDARY) {
            let links = [];
            links.push(
                <PaginationLink
                    key={0}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    nth={0}
                />
            );
            links.push(<PlaceHolderLink />);
            links = [
                ...links,
                ...this.createArrayOfLinks(UPPER_BOUNDARY, numberOfLinks)
            ];

            return links;
        }

        let links = [];
        links.push(
            <PaginationLink key={0} setCurrentPage={setCurrentPage} nth={0} />
        );
        links.push(<PlaceHolderLink />);
        links = [
            ...links,
            ...this.createArrayOfLinks(currentPage - 2, currentPage + 3)
        ];
        links.push(<PlaceHolderLink />);
        links.push(
            <PaginationLink
                key={lastPage}
                setCurrentPage={setCurrentPage}
                nth={lastPage}
            />
        );

        return links;
    }

    createArrayOfLinks(from, to) {
        const { currentPage, setCurrentPage } = this.props;
        const links = [];

        for (let i = from; i < to; ++i) {
            links.push(
                <PaginationLink
                    key={i}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    nth={i}
                />
            );
        }

        return links;
    }

    render() {
        const {
            nextPage,
            prevPage,
            currentPage,
            numberOfItems,
            itemsPerPage
        } = this.props;

        const lower = (currentPage * itemsPerPage) + 1;
        let upper = lower + itemsPerPage - 1;
        upper = upper > numberOfItems ? numberOfItems : upper;

        const isLastPage = currentPage === Math.ceil(numberOfItems / itemsPerPage - 1);
        const isFirstPage = currentPage === 0;

        return (
            <>
                <div>
                    <span className="fw-bold">{lower} - {upper}</span> of <span className="fw-bold">{numberOfItems}</span>
                </div>
                <nav>
                    <ul className="d-flex justify-content-center pagination">
                        <PageLink active={!isFirstPage} onClick={prevPage}>
                            &laquo;
                        </PageLink>
                        {this.generateLinks()}
                        <PageLink
                            active={!isLastPage}
                            onClick={nextPage}
                        >
                            &raquo;    
                        </PageLink>
                    </ul>
                </nav>
            </>
        );
    }
}
