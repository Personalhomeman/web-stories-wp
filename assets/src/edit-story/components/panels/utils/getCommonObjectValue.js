/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Internal dependencies
 */
import getCommonValue from './getCommonValue';

// @todo Test.
/**
 * Get the common value object for `property` for all objects in `list`, based on the property names
 * specified in the `properties` array. If common value is not found, `defaultValue` is assigned instead.
 *
 * @param {Array.<Object>} list  List of objects
 * @param {string} property Property to check on all objects
 * @param {Array} properties List of properties to match.
 * @param {any} defaultValue Default value to assign to property.
 * @return {Object} Found common object values or default values.
 */
function getCommonObjectValue(list, property, properties, defaultValue) {
  const commonValue = {};
  properties.forEach((prop) => {
    const propertyList = list.map((element) => element[property]);
    commonValue[prop] =
      getCommonValue(propertyList || { [prop]: defaultValue }, prop) ??
      defaultValue;
  });
  return commonValue;
}

export default getCommonObjectValue;
