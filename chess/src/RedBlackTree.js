const BLACK = 0;
const RED = 1;

class TreeNode {
    constructor(key) {
        this.key = key;
        this.color = RED;
        this.parent = null;
        this.left = null;
        this.right = null;
    }

    grandparent() {
        if (this.parent === null) {
            return null;
        }
        return this.parent.parent;
    }

    uncle() {
        const grandparent = this.grandparent();

        if (grandparent === null) {
            return null;
        }
        return this.parent === grandparent.right
            ? grandparent.left
            : grandparent.right;
    }

    sibling() {
        if (this.parent === null) {
            return null;
        }
        return this.parent.right === this ? this.parent.left : this.parent.right;
    }

    isOnTheLeft() {
        return this.parent !== null && this.parent.left === this;
    }

    findInorderSuccessor() {
        let tmp = this.right;
        while (tmp !== null && tmp.left !== null) {
            tmp = tmp.left;
        }

        return tmp;
    }

    findInorderPredecessor() {
        let tmp = this.left;
        while (tmp !== null && tmp.right !== null) {
            tmp = tmp.right;
        }

        return tmp;
    }

    static swapColor(a, b) {
        const tmp = a.color;
        a.color = b.color;
        b.color = tmp;
    }

    static isRed(node) {
        return node !== null && node.color === RED;
    }

    static isBlack(node) {
        return node === null || node.color === BLACK;
    }
}

export class RBTree {
    constructor(callback) {
        this.root = null;
        this.size = 0;
        this.compare = callback;
    }

    insert(key) {
        const node = new TreeNode(key);
        let root = this.root;
        let found = null;

        while (true) {
            if (root === null) {
                this.root = node;
                break;
            }

            const compResult = this.compare(node.key, root.key);
            if (compResult < 0) {
                if (root.left === null) {
                    root.left = node;
                    node.parent = root;
                    break;
                }
                root = root.left;
            } else if (compResult > 0) {
                if (root.right === null) {
                    root.right = node;
                    node.parent = root;
                    break;
                }
                root = root.right;
            } else {
                found = root.key;
                break;
            }
        }

        if (found === null) {
            ++this.size;
            this.balanceAfterInsertion(node);
        }

        return found;
    }

    inorder() {
        RBTree.inorderHelper(this.root);
    }

    find(key) {
        let root = this.root;

        while (true) {
            if (root === null) {
                return null;
            }

            const compResult = this.compare(key, root.key);
            if (compResult === 0) {
                return root;
            }
            if (compResult < 0) {
                root = root.left;
            } else {
                root = root.right;
            }
        }
    }

    remove(key) {
        const node = this.find(key);
        if (node !== null) {
            this.removeNode(node);
            --this.size;
        }
    }

    removeNode(node) {
        if (node.left !== null && node.right !== null) {
            const next = node.findInorderPredecessor();
            node.key = next.key;
            node = next;
        }

        if (node.left === null && node.right === null) {
            if (node === this.root) {
                this.root = null;
            } else if (TreeNode.isRed(node)) {
                this.replaceNodes(node, null);
            } else {
                const sibling = node.sibling();
                this.replaceNodes(node, null);
                this.fixDoubleBlack(sibling);
            }
        } else {
            const child = node.right === null ? node.left : node.right;
            if (TreeNode.isRed(child)) {
                child.color = BLACK;
                this.replaceNodes(node, child);
            } else {
                const sibling = node.sibling();
                this.replaceNodes(node, child);
                this.fixDoubleBlack(sibling);
            }
        }

        node.parent = node.left = node.right = null;
    }

    balanceAfterInsertion(node) {
        while (true) {
            if (node === this.root) {
                node.color = BLACK;
                return;
            }

            const parent = node.parent;
            if (TreeNode.isBlack(parent)) {
                return;
            }

            const grandparent = node.grandparent();
            const uncle = node.uncle();

            if (TreeNode.isRed(uncle)) {
                grandparent.color = RED;
                parent.color = BLACK;
                uncle.color = BLACK;
                node = grandparent;
                continue;
            }

            if (grandparent === null) {
                return;
            }

            if (parent.isOnTheLeft()) {
                if (node.isOnTheLeft()) {
                    TreeNode.swapColor(grandparent, parent);
                    this.rotateRight(grandparent);
                } else {
                    TreeNode.swapColor(grandparent, node);
                    this.rotateLeft(parent);
                    this.rotateRight(grandparent);
                }
            } else {
                if (node.isOnTheLeft()) {
                    TreeNode.swapColor(grandparent, node);
                    this.rotateRight(parent);
                    this.rotateLeft(grandparent);
                } else {
                    TreeNode.swapColor(grandparent, parent);
                    this.rotateLeft(grandparent);
                }
            }

            return;
        }
    }

    fixDoubleBlack(sibling) {
        while (true) {
            if (sibling === null) {
                return;
            }

            const parent = sibling.parent;
            const left = sibling.left;
            const right = sibling.right;

            if (TreeNode.isRed(sibling)) {
                if (sibling.isOnTheLeft()) {
                    TreeNode.swapColor(parent, sibling);
                    this.rotateRight(parent);
                    sibling = right;
                    continue;
                } else {
                    TreeNode.swapColor(parent, sibling);
                    this.rotateLeft(parent);
                    sibling = left;
                    continue;
                }
            } else {
                if (TreeNode.isBlack(left) && TreeNode.isBlack(right)) {
                    sibling.color = RED;
                    if (TreeNode.isBlack(parent)) {
                        sibling = parent.sibling();
                        continue;
                    }
                    parent.color = BLACK;
                } else {
                    if (sibling.isOnTheLeft()) {
                        if (TreeNode.isRed(left)) {
                            left.color = BLACK;
                            TreeNode.swapColor(parent, sibling);
                            this.rotateRight(parent);
                        } else if (TreeNode.isRed(right) && TreeNode.isBlack(left)) {
                            right.color = BLACK;
                            TreeNode.swapColor(parent, right);
                            this.rotateLeft(sibling);
                            this.rotateRight(parent);
                        }
                    } else {
                        if (TreeNode.isRed(right)) {
                            right.color = BLACK;
                            TreeNode.swapColor(parent, sibling);
                            this.rotateLeft(parent);
                        } else if (TreeNode.isRed(left) && TreeNode.isBlack(right)) {
                            left.color = BLACK;
                            TreeNode.swapColor(parent, left);
                            this.rotateRight(sibling);
                            this.rotateLeft(parent);
                        }
                    }
                }
            }

            return;
        }
    }

    replaceNodes(a, b) {
        if (a === this.root) {
            b.parent = null;
            this.root = b;
        } else {
            if (a.parent.right === a) {
                a.parent.right = b;
            } else {
                a.parent.left = b;
            }

            if (b !== null) {
                b.parent = a.parent;
            }
        }
    }

    static inorderHelper(root) {
        if (root === null) {
            return;
        }

        RBTree.inorderHelper(root.left);
        console.log(root);
        RBTree.inorderHelper(root.right);
    }

    rotateLeft(node) {
        const right = node.right;
        const parent = node.parent;

        if (parent === null) {
            this.root = right;
            right.parent = null;
        } else {
            if (node.isOnTheLeft()) {
                parent.left = right;
            } else {
                parent.right = right;
            }
            right.parent = parent;
        }

        node.right = right.left;
        if (right.left !== null) {
            right.left.parent = node;
        }
        right.left = node;
        node.parent = right;
    }

    rotateRight(node) {
        const left = node.left;
        const parent = node.parent;

        if (parent === null) {
            this.root = left;
            left.parent = null;
        } else {
            if (node.isOnTheLeft()) {
                parent.left = left;
            } else {
                parent.right = left;
            }
            left.parent = parent;
        }

        node.left = left.right;
        if (left.right !== null) {
            left.right.parent = node;
        }
        left.right = node;
        node.parent = left;
    }
}
