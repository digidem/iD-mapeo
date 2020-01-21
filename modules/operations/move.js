import { t } from '../util/locale';
import { behaviorOperation } from '../behavior/operation';
import { geoExtent } from '../geo';
import { modeMove } from '../modes/move';
import { isNode, utilGetAllNodes } from '../util';


export function operationMove(selectedIDs, context) {
    var multi = (selectedIDs.length === 1 ? 'single' : 'multiple');
    var nodes = utilGetAllNodes(selectedIDs, context.graph());
    var coords = nodes.map(function(n) { return n.loc; });
    var extent = nodes.reduce(function(extent, node) {
        return extent.extend(node.extent(context.graph()));
    }, geoExtent());


    var operation = function() {
        context.enter(modeMove(context, selectedIDs));
    };


    operation.available = function() {
        return selectedIDs.length > 1 ||
            !isNode(context.entity(selectedIDs[0]));
    };


    operation.disabled = function() {
        if (extent.area() && extent.percentContainedIn(context.extent()) < 0.8) {
            return 'too_large';
        } else if (someMissing()) {
            return 'not_downloaded';
        } else if (selectedIDs.some(context.hasHiddenConnections)) {
            return 'connected_to_hidden';
        } else if (selectedIDs.some(incompleteRelation)) {
            return 'incomplete_relation';
        }

        return false;


        function someMissing() {
            if (context.inIntro()) return false;
            var osm = context.connection();
            if (osm) {
                var missing = coords.filter(function(loc) { return !osm.isDataLoaded(loc); });
                if (missing.length) {
                    missing.forEach(function(loc) { context.loadTileAtLoc(loc); });
                    return true;
                }
            }
            return false;
        }

        function incompleteRelation(id) {
            var entity = context.entity(id);
            return entity.type === 'relation' && !entity.isComplete(context.graph());
        }
    };


    operation.tooltip = function() {
        var disable = operation.disabled();
        return disable ?
            t('operations.move.' + disable + '.' + multi) :
            t('operations.move.description.' + multi);
    };


    operation.annotation = function() {
        return selectedIDs.length === 1 ?
            t('operations.move.annotation.' + context.geometry(selectedIDs[0])) :
            t('operations.move.annotation.multiple');
    };


    operation.id = 'move';
    operation.keys = [t('operations.move.key')];
    operation.title = t('operations.move.title');
    operation.behavior = behaviorOperation(context).which(operation);

    return operation;
}
