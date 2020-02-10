
module.exports = function () {
    this.head = null;
    this.size = 0;
    this.currentNode = null;
    this.currentNodeIndex = 0;

    this.pointToHead = function(){
        this.currentNode = this.head;
        this.currentNodeIndex = 0;
    }

    this.getCurrentNode = function(){
        return this.currentNode;
    }

    this.getCurrentNodeIndex = function(){
        if(this.currentNode == null || this.currentNode == undefined){
            return null;
        }
        return this.currentNodeIndex;
    }

    this.moveToNextNode = function(){
        if(this.currentNode == null || this.currentNode == undefined){
            return null;
        }
        this.currentNode = this.currentNode.next;
        ++this.currentNodeIndex;
        return this.currentNode;
    }

    // adds an element at the end 
    // of list 
    this.add = function (element) {
        // creates a new node 
        var node = this.getNode(element);

        // to store current node 
        var current;

        // if list is Empty add the 
        // element and make it head 
        if (this.head == null)
            this.head = node;
        else {
            current = this.head;

            // iterate to the end of the 
            // list 
            while (current.next) {
                current = current.next;
            }

            // add node 
            current.next = node;
        }
        this.size++;
    }

    // removes an element from the 
    // specified location 
    this.removeFrom = function (index) {
        if (index > 0 && index > this.size)
            return -1;
        else {
            var curr, prev, it = 0;
            curr = this.head;
            prev = curr;

            // deleting first element 
            if (index === 0) {
                this.head = curr.next;
            } else {
                // iterate over the list to the 
                // position to removce an element 
                while (it < index) {
                    it++;
                    prev = curr;
                    curr = curr.next;
                }

                // remove the element 
                prev.next = curr.next;
            }
            this.size--;

            // return the remove element 
            return curr.element;
        }
    }

    // removes an element from the 
    // specified location 
    this.getElementAtIndex = function (index) {
        if (index > 0 && index > this.size)
            return -1;
        else {
            var curr, prev, it = 0;
            curr = this.head;
            prev = curr;

            // deleting first element 
            if (index === 0) {
                this.head = curr.next;
            } else {
                // iterate over the list to the 
                // position to removce an element 
                while (it < index) {
                    it++;
                    prev = curr;
                    curr = curr.next;
                }
            }
            return curr.element;
        }
    }

    // removes a given element from the 
    // list 
    this.removeElement = function (element) {
        var current = this.head;
        var prev = null;

        // iterate over the list 
        while (current != null) {
            // comparing element with current 
            // element if found then remove the 
            // and return true 
            if (current.element === element) {
                if (prev == null) {
                    this.head = current.next;
                } else {
                    prev.next = current.next;
                }
                this.size--;
                return current.element;
            }
            prev = current;
            current = current.next;
        }
        return -1;
    }

    // finds the index of element 
    this.indexOf = function (element) {
        var count = 0;
        var current = this.head;

        // iterae over the list 
        while (current != null) {
            // compare each element of the list 
            // with given element 
            if (current.element === element)
                return count;
            count++;
            current = current.next;
        }

        // not found 
        return -1;
    }

    // checks the list for empty 
    this.isEmpty = function () {
        return this.size == 0;
    }
    // gives the size of the list 
    this.sizeOfList = function () {
        console.log(this.size);
    }
    // prints the list items 
    this.printList = function () {
        var curr = this.head;
        var str = "";
        while (curr) {
            str += curr.element + " ";
            curr = curr.next;
        }
        console.log(str);
    }

    // insert element at the position index 
    // of the list 
    this.insertAt = function (element, index) {
        if (index > 0 && index > this.size)
            return false;
        else {
            // creates a new node 
            var node = this.getNode(element);
            var curr, prev;

            curr = this.head;

            // add the element to the 
            // first index 
            if (index == 0) {
                node.next = head;
                this.head = node;
            } else {
                curr = this.head;
                var it = 0;

                // iterate over the list to find 
                // the position to insert 
                while (it < index) {
                    it++;
                    prev = curr;
                    curr = curr.next;
                }

                // adding an element 
                node.next = curr;
                prev.next = node;
            }
            this.size++;
        }
    }


    this.getNode = function (element) {
        return {
            element: element,
            next: null,
        }
    }
}