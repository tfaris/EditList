/*
 * jQuery Editable List plugin
 *
 * Author: Tom Faris
 *
 * Use the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

;
(function ($) {
    $.fn.extend({
        editlist: function(){
            return this.each(function(){
                // Add default empty "add" list item
                var addLink = $("<li class='editableListAdd'><span class='editableListLink add'></span></li>");
                $(this).append(addLink);
                new $.EditableList(this);
            });
        }
    });

    $.EditableList = function(input){
        var editableList = $(input);

        editableList.delegate('li', 'click', function(event){
            var item = $(this);

            if (editableList.find(".editableList-editing").size() > 0){
                return;
            }

            if (isAddItem(item)){
                addListItem("");
                selectLast();
            }
            else if (!item.hasClass("editableList-editing")){
                item.addClass("editableList-editing")
                var tmp = item.text(),
                    inputText = "<input id='editableListEditor' class='editListInput' type='text' value='"+tmp+"'>";

                // Surround the original HTML in a hidden div so we can save it, and add an input for editing.
                var newHTML = inputText + "<div class='editableListOriginal' style='display:none'>" + item[0].innerHTML + "</div>";
                item[0].innerHTML = newHTML;

                var input = $("#editableListEditor");
                input.blur(function(){
                    if (item.hasClass("editableList-editing")){
                        item.removeClass("editableList-editing");

                        if (this.value){
                            // Find the div surrounding the original elements
                            var coverDiv = item.find(".editableListOriginal"),
                                original = coverDiv.contents();
                            // Find the input's parent list item
                            var listItemParent = input.parent("li");
                            input.remove();
                            // Remove the surrounding div and replace it with the original HTML
                            coverDiv.replaceWith(original);
                            // Replace text nodes if they exist, or append the text (new item)
                            var textNodes = original.filter(function(){ return this.nodeType == 3; });
                            if (textNodes.size() > 0){
                                textNodes.replaceWith(this.value);
                            } else{
                                item.append(this.value);
                            }
                            // Update the field value
                            var listName = editableList.attr("name");
                            if (listName){
                                $(".editableListField[name='"+listName+listItemParent.index()+"']").val(this.value);
                            }
                        }
                        else{
                            // Input is empty, remove the field. Don't force selection, in case it's the last item.
                            removeListItem(input.parent("li").index()+1, false);
                        }
                    }
                });
                input.keydown(function(e){
                    if (e.which == 13){ // enter
                        e.preventDefault();
                    }
                });
                input.keyup(function(e){
                    if (e.which == 13){ // enter
                        if (this.value){
                            var listIndex = $(this).parent("li").index();
                            // Remove focus, add another item, set focus to that item by "clicking" it
                            $(this).trigger('blur');
                            if (listIndex == editableList.find("li").size()-1){
                                addListItem("");
                                selectLast();
                            }
                            else{
                                selectItem(listIndex+1);
                            }
                        }
                        else{
                            // If empty, remove the item.
                            removeListItem($(this).parent("li").index()+1, false);
                        }
                        e.preventDefault();
                    }
                });

                event.stopPropagation();
                input.trigger('focus');
                if (input.length > 0){
                    input[0].select();
                }
            }
        });

        editableList.delegate('.editableListLink.remove', 'click', function(e){
            // Remove the list item associated with the remove link
            removeListItem($(this).parent("li").index() + 1, false);
            e.preventDefault();
        });

        function isAddItem(item){
            return item.find(".editableListLink.add").size() > 0;
        }
        function selectItem(itemIndex){
            var items = editableList.find("li");
            items[itemIndex].click();
        };
        function selectLast(){
            var items = editableList.find("li");
            selectItem(items.length-2);
        };
        function selectNext(currentlySelected){
            var items = editableList.find("li"),
                curIndex = currentlySelected.index();
            if (curIndex + 1 < items.length){
                selectItem(curIndex + 1);
            }
        }
        function updateFields(){
            var listName = editableList.attr("name");
            editableList.find("li").each(function(index){
                var item = $(this);

                if (!item.hasClass("editableListItem")){
                    item.addClass("editableListItem");
                }

                if (!isAddItem(item)){

                    if (listName){
                        var value =  item.contents().filter(function(){ return this.nodeType == 3; }).text(),
                            field = item.find("input[type=hidden][class='editableListField']");
                        if (field.length > 0){
                            // Change the input name to match the item's index
                            field.attr("name", listName+index);
                        } else{
                            // Create an input and append to the item
                            var newField = $("<input type='hidden' class='editableListField' name='"+listName+index+"' value='"+value+"'>");
                            item.append(newField);
                        }
                    }
                    // Add the item remove link
                    if (item.find(".editableListLink.remove").size() == 0){
                        item.append($("<span class='editableListLink remove'></span>"));
                    }
                }
            });
        };
        function addListItem(content){
            var newItem = $("<li>"+content+"</li>").insertBefore(editableList.find(".editableListAdd"));
            updateFields();
            return newItem;
        };
        function removeListItem(itemNumber, selectItem){
            var removed = editableList.find("li:nth-child("+itemNumber+")").remove();
            if (editableList.find("li").size() == 0){
                addListItem("");
                if (selectItem){
                    selectLast();
                }
            }
            updateFields();
            return removed;
        };
        updateFields();
    }
})(jQuery);